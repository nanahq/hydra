import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  AcceptFleetInviteDto,
  CreateAccountWithOrganizationDto,
  Delivery,
  Driver,
  DriverStatGroup,
  FitRpcException, FleetMember, FleetOrganization, FleetOrgStat,
  FleetPayout,
  internationalisePhoneNumber,
  IRpcException,
  OrderStatus,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  RegisterDriverDto,
  ResponseWithStatus, SOCKET_MESSAGE, UpdateFleetMemberProfileDto, UpdateFleetOwnershipStatusDto,
  VendorApprovalStatus
} from '@app/common'
import { FleetOrgRepository } from './fleets-organization.repository'
import { FleetMemberRepository } from './fleets-member.repository'
import * as bcrypt from 'bcryptjs'
import { EventsGateway } from '../websockets/events.gateway'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DriversServiceService } from '../drivers-service.service'
import { DriverRepository } from '../drivers-service.repository'
import { OdsaRepository } from '../ODSA/odsa.repository'
import { ODSA } from '../ODSA/odsa.service'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, catchError } from 'rxjs'

@Injectable()
export class FleetService {
  private readonly logger = new Logger(FleetService.name)

  constructor (
    private readonly organizationRepository: FleetOrgRepository,
    private readonly memberRepository: FleetMemberRepository,
    private readonly driverService: DriversServiceService,
    private readonly driverRepository: DriverRepository,
    private readonly eventsGateway: EventsGateway,
    private readonly odsaRepository: OdsaRepository,
    private readonly odsaService: ODSA,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  public async getProfile (id: string): Promise<FleetMember> {
    try {
      const profile = await this.memberRepository.findOne({ _id: id })

      if (profile === null) {
        throw new NotFoundException('No profile with the given Id')
      }

      profile.password = ''
      return profile
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch driver profile ${id} `,
        error
      })

      if (error instanceof NotFoundException) {
        throw new FitRpcException('No user found with the given ID', HttpStatus.UNAUTHORIZED)
      } else {
        throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  public async validateDriver (
    email: string,
    password: string
  ): Promise<FleetMember> {
    const member: FleetMember = await this.memberRepository.findOneAndPopulate({
      email: email.toLowerCase()
    }, ['organization'])
    if (member === null) {
      throw new FitRpcException('Incorrect email', HttpStatus.NOT_FOUND)
    }
    const isCorrectPassword = await bcrypt.compare(password, member.password)
    if (!isCorrectPassword) {
      throw new FitRpcException('Incorrect password', HttpStatus.UNAUTHORIZED)
    }
    member.password = ''
    return member as any
  }

  async createFleetOrganization (payload: CreateAccountWithOrganizationDto): Promise<ResponseWithStatus> {
    const existingMember = await this.memberRepository.findOne({
      $or: [
        { email: payload.email.toLowerCase() },
        { phone: internationalisePhoneNumber(payload.phone) }
      ]
    })

    if (existingMember) {
      throw new FitRpcException(
        'You already belong to an organization.',
        HttpStatus.CONFLICT
      )
    }

    // Check if organization name already exists
    const existingOrg = await this.organizationRepository.findOne({
      email: payload.email.toLowerCase()
    })

    if (existingOrg) {
      throw new FitRpcException(
        'An organization with this email already exists.',
        HttpStatus.CONFLICT
      )
    }
    const createOrganization = await this.organizationRepository.create({
      ...payload,
      name: payload.organization,
      inviteLink: RandomGen.genRandomString(100, 20)
    })

    const newMember = await this.memberRepository.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      isOwner: true,
      phone: internationalisePhoneNumber(payload.phone),
      email: payload.email.toLowerCase(),
      password: await bcrypt.hash(payload.password, 10),
      organization: createOrganization._id.toString()
    })

    await this.organizationRepository.findOneAndUpdate({
      _id: createOrganization._id.toString()
    }, {
      $push: { members: newMember._id.toString(), owners: newMember._id.toString() }
    })

    this.logger.log(`New organization '${payload.organization}' created with member '${payload.email}'`)

    return { status: 1 }
  }

  async acceptFleetOrgInvite (payload: AcceptFleetInviteDto): Promise<ResponseWithStatus> {
    const existingMember = await this.memberRepository.findOne({
      phone: internationalisePhoneNumber(payload.phone)
    })

    if (existingMember !== null) {
      throw new FitRpcException(
        'Member already belongs to an organization',
        HttpStatus.CONFLICT
      )
    }

    try {
      const organization: FleetOrganization = await this.organizationRepository.findOne(
        {
          inviteLink: payload.inviteLink
        }
      )

      const createMember = await this.memberRepository.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: internationalisePhoneNumber(payload.phone),
        password: await bcrypt.hash(payload.password, 10),
        email: payload.email.toLowerCase(),
        organization: organization._id.toString()
      })

      await this.organizationRepository.findOneAndUpdate(
        { _id: organization._id.toString() },
        {
          $push: { members: createMember._id.toString() }
        }
      )

      this.logger.log(`New member with email:'${payload.email}' created.`)

      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to register new member ${payload.email} `,
        error
      })
      throw new FitRpcException(
        'Can not register a new member at the moment. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateOrgOwnership (data: UpdateFleetOwnershipStatusDto): Promise<ResponseWithStatus> {
    const member = await this.memberRepository.findOneAndUpdate({ _id: data.memberId }, { isOwner: data.status })
    if (data.status) {
      await this.organizationRepository.findOneAndUpdate({
        _id: member?._id?.toString()
      },
      {
        $addToSet: { owners: data.memberId }
      }
      )
    } else {
      await this.organizationRepository.findOneAndUpdate({
        _id: member?._id?.toString()
      },
      {
        $pull: { owners: data.memberId }
      }
      )
    }
    return { status: 1 }
  }

  async getFleetOrganization (inviteLink: string): Promise<FleetOrganization> {
    try {
      const organization = await this.organizationRepository.findOne({ inviteLink })

      if (organization === null) {
        throw new NotFoundException('No organization with the given invite link')
      }

      return organization
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch organization with ${inviteLink} `,
        error
      })

      if (error instanceof NotFoundException) {
        throw new FitRpcException('No organization with the given ID', HttpStatus.NOT_FOUND)
      } else {
        throw new FitRpcException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async ownerCreateDriver (
    payload: RegisterDriverDto
  ): Promise<ResponseWithStatus> {
    try {
      const organization: FleetOrganization = await this.organizationRepository.findOne(
        {
          _id: payload.organization
        }
      )

      if (organization === null) {
        throw new NotFoundException('Organization not found')
      }

      const existingMember = await this.memberRepository.findOne({
        email: payload.email.toLowerCase()
      })

      if (existingMember) {
        throw new FitRpcException(
          'Email already registered',
          HttpStatus.CONFLICT
        )
      }

      const _driver: Partial<Driver> = {
        ...payload,
        password: await bcrypt.hash(payload.password, 10)
      }
      this.logger.log(`Registering a new driver with email: ${payload.email}`)

      const driver = await this.driverRepository.create(_driver)

      await this.driverRepository.findOneAndUpdate({
        _id: driver._id
      },
      { acc_status: VendorApprovalStatus.APPROVED })

      await this.organizationRepository.findOneAndUpdate(
        { _id: payload.organization },
        {
          $push: { drivers: driver._id.toString(), members: driver._id.toString() }
        }
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to register new driver ${payload.email} `,
        error
      })
      throw new FitRpcException(
        'Can not register a new driver at the moment. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateOgranization (
    payload: Partial<FleetOrganization>,
    organizationId: string
  ): Promise<ResponseWithStatus> {
    try {
      await this.organizationRepository.findOneAndUpdate(
        { _id: organizationId.toString() },
        { ...payload }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update organization. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async uploadOrganizationLogo (data: any, _id: string): Promise<void> {
    try {
      await this.organizationRepository.findOneAndUpdate(
        { _id },
        { image: data }
      )
    } catch (e) {
      throw new FitRpcException(
        'Failed to upload logo',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async updateMemberProfile (
    payload: UpdateFleetMemberProfileDto,
    memberId: string
  ): Promise<ResponseWithStatus> {
    try {
      await this.memberRepository.findOneAndUpdate(
        { _id: memberId.toString() },
        { ...payload }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update member. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllOrganizationMembers (organization: string): Promise<FleetMember[]> {
    const getRequest = await this.memberRepository.find(
      { organization }
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all organization members.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllOrganizationDrivers (organization: string): Promise<Driver[]> {
    const getRequest = await this.driverRepository.find(
      { organization }
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all organization drivers.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getPopulatedMember (_id: string): Promise<FleetMember> {
    try {
      const member = await this.memberRepository.findOneAndPopulate<FleetMember>(
        { _id },
        ['organization']
      )
      if (member === null) {
        throw new FitRpcException(
          'Member with that id can not be found',
          HttpStatus.NOT_FOUND
        )
      }

      return member
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new FitRpcException('No member found with the given ID', HttpStatus.UNAUTHORIZED)
      } else {
        throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getMapDeliveries (): Promise<Delivery[]> {
    const deliveries: Delivery[] = await this.odsaRepository
      .findRaw()
      .find({
        completed: false,
        assignedToDriver: false,
        status: { $ne: OrderStatus.FULFILLED }
      })
      .populate('vendor')
      .populate({
        path: 'order',
        populate: {
          path: 'listing'
        }
      })
      .exec()

    const uniqueDeliveries = Array.from(
      new Map(deliveries.map((delivery) => [delivery._id.toString(), delivery])).values()
    )

    return uniqueDeliveries as any
  }

  async getOrganizationDeliveries (organization: string): Promise<Delivery[]> {
    const drivers = await this.driverRepository.find({ organization })
    const driverIds = drivers.map((driver) => driver._id.toString())

    const deliveries: Delivery[] = await this.odsaRepository
      .findRaw()
      .find({
        completed: false,
        assignedToDriver: false,
        status: { $ne: OrderStatus.FULFILLED },
        pool: { $in: driverIds }
      })
      .populate('vendor')
      .populate('user')
      .populate({
        path: 'order',
        populate: {
          path: 'listing'
        }
      })
      .exec()
    const uniqueDeliveries = Array.from(
      new Map(deliveries.map((delivery) => [delivery._id.toString(), delivery])).values()
    )
    return uniqueDeliveries as any
  }

  async assignFleetDrivers (
    driverId: string,
    deliveryId: string
  ): Promise<void> {
    try {
      const checkDriver = await this.driverRepository.find(
        {
          _id: driverId,
          status: 'ONLINE',
          available: true
        }
      )

      if (checkDriver === null) {
        throw new FitRpcException(
          'Something went wrong fetching the driver.',
          HttpStatus.BAD_REQUEST
        )
      }

      await this.odsaService.handleAcceptDelivery({ deliveryId, driverId })
    } catch (error) {
      this.logger.error(
        `Something went wrong processing order with deliveryId: ${deliveryId}`
      )
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not process order right now',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getFleetDriverStats (driverId: string, memberId: string): Promise<DriverStatGroup> {
    const [member, driver]: [FleetMember, Driver] = await Promise.all([
      this.memberRepository.findOne({ _id: memberId }),
      this.driverRepository.findOne({ _id: driverId })
    ])

    if (!driver) {
      throw new FitRpcException(
        'Driver not found',
        HttpStatus.NOT_FOUND
      )
    }
    if (member.organization.toString() !== driver.organization.toString()) {
      throw new FitRpcException(
        'Driver does not belong to your organization',
        HttpStatus.FORBIDDEN
      )
    }

    return await this.odsaService.getDriverStats(driverId)
  }

  async getDriverPayout (organization: string, driverId: string): Promise<FleetPayout[]> {
    const checkDriver = await this.driverRepository.findOne({
      _id: driverId,
      organization
    })

    if (checkDriver === null) {
      throw new FitRpcException(
        'Driver not found',
        HttpStatus.NOT_FOUND
      )
    }

    return await lastValueFrom<FleetPayout[]>(
      this.paymentClient.send(QUEUE_MESSAGE.FLEET_GET_PAYOUT_DRIVER, { driverId }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  async getAllDriversPayout (organization: string): Promise<FleetPayout[]> {
    return await lastValueFrom<FleetPayout[]>(
      this.paymentClient.send(QUEUE_MESSAGE.FLEET_GET_ALL_PAYOUTS, { organization }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  public async getOrganizationStats (organizationId: string, filterQuery: { gte: string, lte: string }): Promise<FleetOrgStat> {
    const DEFAULT = {
      totalDeliveries: 0,
      totalDistance: 0,
      totalEarnings: 0,
      totalTimeSpent: 0,
      averageDeliveryDistance: 0,
      averageDeliveryTime: 0,
      driversEarnings: {},
      totalDrivers: 0,
      averageDelivery: 0
    }

    const organizationDrivers: Driver[] = await this.driverRepository.find({ organization: organizationId })

    if (!Array.isArray(organizationDrivers) || !organizationDrivers?.length) {
      return DEFAULT
    }
    DEFAULT.totalDrivers = organizationDrivers.length

    function mapDriverIdToName (driverId: string): string {
      const driver = organizationDrivers.find(driver => driver._id.toString() === driverId)

      if (!driver) {
        return ''
      }

      return `${driver.firstName} ${driver.lastName}`
    }

    const driversId = organizationDrivers.map((driver) => driver._id.toString())

    const organizationDeliveries: Delivery[] = await this.odsaRepository.find({
      driver: { $in: driversId },
      createdAt: {
        $gte: filterQuery.gte,
        $lte: filterQuery.lte
      },
      deliveryFee: { $exists: true, $ne: null }
    })

    if (!organizationDeliveries?.length) {
      return DEFAULT
    }

    for (const organizationDelivery of organizationDeliveries) {
      const driverName = mapDriverIdToName(organizationDelivery.driver)
      DEFAULT.totalDeliveries += 1
      DEFAULT.totalEarnings += organizationDelivery.deliveryFee
      DEFAULT.totalDistance += organizationDelivery?.travelMeta?.distance ?? 1
      DEFAULT.totalTimeSpent += organizationDelivery?.travelMeta?.travelTime ?? 1

      if (DEFAULT.driversEarnings[driverName] !== undefined) {
        DEFAULT.driversEarnings[driverName] += organizationDelivery.deliveryFee as any
      } else {
        DEFAULT.driversEarnings[driverName] = organizationDelivery.deliveryFee as any
      }
    }

    DEFAULT.averageDelivery = DEFAULT.totalEarnings / organizationDeliveries.length

    DEFAULT.averageDeliveryDistance = DEFAULT.totalDistance / organizationDeliveries.length

    return { ...DEFAULT, totalDrivers: organizationDrivers.length }
  }

  //   @Crons

  /**
   *
   */

  @Cron(CronExpression.EVERY_MINUTE)
  async pushOutFleetDriversLocation (): Promise<void> {
    try {
      const organizations = await this.organizationRepository.findRaw()
        .find({})
        .select('_id name owners members drivers')
        .populate({
          path: 'owners',
          select: 'firstName lastName'
        })
        .populate({
          path: 'members',
          select: 'firstName lastName'
        })
        .populate({
          path: 'drivers',
          select: '_id firstName lastName location phone status'
        })
        .exec() as any

      for (const organization of organizations) {
        this.eventsGateway.server.emit(SOCKET_MESSAGE.FLEET_PUSH_OUT_DRIVERS, {
          organization: organization?._id,
          data: organization
        } as any)
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
    }
  }
}
