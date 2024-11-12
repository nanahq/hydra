import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common'
import {
  Driver,
  DriverWalletI,
  FitRpcException,
  FleetOrganization,
  internationalisePhoneNumber,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  RegisterDriverDto,
  ResponseWithStatus,
  VendorApprovalStatus
} from '@app/common'
import { DriverRepository } from './drivers-service.repository'
import { FleetOrgRepository } from './fleets-organization.repository'
import { FleetMemberRepository } from './fleets-member.repository'
import * as bcrypt from 'bcryptjs'
// import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy } from '@nestjs/microservices'
import { createTransaction, updateIsDriverInternalDto } from '@app/common/dto/General.dto'
import { catchError, lastValueFrom } from 'rxjs'
import { AcceptFleetInviteDto, CreateAccountWithOrganizationDto } from '@app/common/dto/fleet.dto'

@Injectable()
export class DriversServiceService {
  private readonly logger = new Logger(DriversServiceService.name)

  constructor (
    private readonly driverRepository: DriverRepository,

    private readonly fleetOrgRepository: FleetOrgRepository,

    private readonly fleetMemberRepository: FleetMemberRepository,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  public async register (
    payload: RegisterDriverDto
  ): Promise<ResponseWithStatus> {
    payload.phone = internationalisePhoneNumber(payload.phone)
    const existingDriver = await this.driverRepository.findOne({
      phone: payload.phone
    })

    if (existingDriver !== null) {
      throw new FitRpcException(
        'Driver already exists. Please log in to your account or reset your password',
        HttpStatus.CONFLICT
      )
    }

    try {
      const _driver: Partial<Driver> = {
        ...payload,
        password: await bcrypt.hash(payload.password, 10)
      }
      this.logger.log(`Registering a new driver with email: ${payload.email}`)

      const driver = await this.driverRepository.create(_driver)

      this.logger.log(`Driver ${payload.email} registered`)

      await lastValueFrom(
        this.paymentClient.emit(QUEUE_MESSAGE.DRIVER_WALLET_CREATE_WALLET, {
          driverId: driver._id.toString()
        })
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to register driver ${payload.email} `,
        error
      })
      throw new FitRpcException(
        'Can not register a new driver at the moment. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateDriver (
    payload: Partial<Driver>,
    driverId: string
  ): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id: driverId.toString() },
        { ...payload }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update driver. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getProfile (id: string): Promise<Driver> {
    try {
      const profile = await this.driverRepository.findOne({ _id: id })

      if (profile === null) {
        throw new Error('No profile with the given Id')
      }

      profile.password = ''
      return profile
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch driver profile ${id} `,
        error
      })
      throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async deleteDriver (id: string): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id: id },
        { isDeleted: true }
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to delete driver profile ${id} `,
        error
      })

      throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async validateDriver (
    phone: string,
    password: string
  ): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      phone
    })

    if (driver === null) {
      this.logger.error({
        message: `Failed to validateVendor driver ${phone}. Driver does not exist `
      })

      throw new FitRpcException('Incorrect phone number', HttpStatus.NOT_FOUND)
    }

    const isCorrectPassword = await bcrypt.compare(password, driver.password)

    if (!isCorrectPassword) {
      this.logger.error({
        message: `Failed to validateVendor driver ${phone}. Password is incorrect `
      })

      throw new FitRpcException('Incorrect password', HttpStatus.UNAUTHORIZED)
    }

    driver.password = ''

    return driver
  }

  public async getAllDrivers (): Promise<Driver[]> {
    try {
      return await this.driverRepository.findAndPopulate({}, ['deliveries'])
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong fetching driver',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllFreeDrivers (): Promise<Driver[]> {
    try {
      return await this.driverRepository.find({ available: true })
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong fetching driver',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async approveDriver (_id: string): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id },
        { acc_status: VendorApprovalStatus.APPROVED }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong fetching driver',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async rejectDriver (_id: string): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id },
        { acc_status: VendorApprovalStatus.DISAPPROVED }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong fetching driver',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async withdrawal (
    payload: createTransaction
  ): Promise<ResponseWithStatus> {
    return lastValueFrom(
      this.paymentClient
        .send<ResponseWithStatus>(
        QUEUE_MESSAGE.DRIVER_WALLET_CREATE_TRANSACTION,
        payload
      )
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  public async fetchWallet (driverId: string): Promise<DriverWalletI> {
    return lastValueFrom(
      this.paymentClient
        .send<DriverWalletI>(QUEUE_MESSAGE.DRIVER_WALLET_FETCH, { driverId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  public async fetchTransactions (driverId: string): Promise<DriverWalletI[]> {
    return lastValueFrom(
      this.paymentClient
        .send<DriverWalletI[]>(QUEUE_MESSAGE.DRIVER_WALLET_FETCH_TRANSACTIONS, {
        driverId
      })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  public async updateDriverIsInternal (data: updateIsDriverInternalDto): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id: data.id },
        { internal: data.internal }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /**
   *  Cron to run every 30 minutes to flag inactive driver offline.
   *  The logic behind this is using updatedAt - drivers send location updates every 20 seconds via sockets
   *  if last updateAt  >  5 minute, driver should go offline
   */
  // @Cron(CronExpression.EVERY_30_MINUTES)
  async flagDriversOffline (): Promise<void> {
    this.logger.debug('PIM -> Flagging Drivers Offline')
    try {
      const date = new Date()
      const pastTwoMinutes = new Date(date.getTime() - 2 * 60 * 1000)

      const driversThatWentOffline: Driver[] = await this.driverRepository.find(
        {
          updatedAt: {
            $lt: pastTwoMinutes.toISOString()
          },
          status: 'ONLINE',
          // isValidated: true,
          available: true
        }
      )

      if (driversThatWentOffline?.length < 1) {
        return
      }

      const driverIds = driversThatWentOffline.map((driver) =>
        driver._id.toString()
      )

      await this.driverRepository.findAndUpdate(
        { _id: { $in: driverIds } },
        { status: 'OFFLINE' }
      )
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          message: 'Something went wrong flagging drivers offline',
          error
        })
      )
    }
  }

  async createFleetOrganization (payload: CreateAccountWithOrganizationDto): Promise<ResponseWithStatus> {
    const existingOrganization = await this.fleetOrgRepository.findOne({
      name: payload.organization.toLowerCase()
    })

    if (existingOrganization !== null) {
      throw new FitRpcException(
        'Organization name already already exists',
        HttpStatus.CONFLICT
      )
    }

    try {
      const createOrganization = await this.fleetOrgRepository.create({
        name: payload.organization,
        inviteLink: RandomGen.genRandomString()
      })

      const newMember = await this.fleetMemberRepository.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: internationalisePhoneNumber(payload.phone),
        email: payload.email,
        password: await bcrypt.hash(payload.password, 10),
        organization: createOrganization._id.toString()
      })

      await this.fleetOrgRepository.findOneAndUpdate({
        _id: createOrganization._id
      }, {
        $push: { members: newMember._id, owners: newMember._id }
      })

      this.logger.log(`New organization '${payload.organization}' created with member '${payload.email}'`)

      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to register new organization ${payload.email} `,
        error
      })
      throw new FitRpcException(
        'Can not register a new organization at the moment. Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async acceptFleetOrgInvite (payload: AcceptFleetInviteDto): Promise<ResponseWithStatus> {
    const existingMember = await this.fleetMemberRepository.findOne({
      phone: internationalisePhoneNumber(payload.phone)
    })

    if (existingMember !== null) {
      throw new FitRpcException(
        'Member already belongs to another organization',
        HttpStatus.CONFLICT
      )
    }

    try {
      const organization: FleetOrganization = await this.fleetOrgRepository.findOne(
        {
          inviteLink: payload.inviteLink
        }
      )

      const createMember = await this.fleetMemberRepository.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: internationalisePhoneNumber(payload.phone),
        password: await bcrypt.hash(payload.password, 10),
        email: payload.email,
        organization: organization._id.toString()
      })

      await this.fleetOrgRepository.findOneAndUpdate(
        { _id: organization._id },
        {
          $push: { members: createMember._id }
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

  async getFleetOrganization (inviteLink: string): Promise<FleetOrganization> {
    try {
      const organization = await this.fleetOrgRepository.findOne({ inviteLink })

      if (organization === null) {
        throw new Error('No organization with the given invite link')
      }

      return organization
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch organization with ${inviteLink} `,
        error
      })
      throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async ping (): Promise<string> {
    return 'PONG'
  }
}
