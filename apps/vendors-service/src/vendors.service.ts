import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import {
  BrevoClient,
  FitRpcException,
  ListingMenuI,
  LocationCoordinates,
  LoginVendorRequest,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  SendApprovalPushNotification,
  ServicePayload,
  UpdateVendorStatus,
  VendorApprovalStatus,
  VendorI,
  VendorServiceHomePageResult,
  VendorStatI,
  VendorWithListingsI
} from '@app/common'
import {
  CreateVendorDto,
  UpdateVendorSettingsDto
} from '@app/common/database/dto/vendor.dto'
import { arrayParser } from '@app/common/utils/statsResultParser'
import {
  VendorRepository,
  VendorSettingsRepository
} from './vendors.repository'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'
import { internationalisePhoneNumber } from '@app/common/utils/phone.number'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { UpdateVendorReviewDto } from '@app/common/dto/General.dto'
import { CreateBrevoContact } from '@app/common/dto/brevo.dto'

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name)

  constructor (
    private readonly vendorRepository: VendorRepository,
    private readonly vendorSettingsRepository: VendorSettingsRepository,

    private readonly brevoClient: BrevoClient,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,

    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy
  ) {}

  async seedDatabase (): Promise<void> {
    const vendorsWithoutFriendlyUrl: Vendor[] =
      await this.vendorRepository.find({ friendlyId: undefined })

    for (const vendorsWithoutFriendlyUrlElement of vendorsWithoutFriendlyUrl) {
      const friendlyId = vendorsWithoutFriendlyUrlElement.businessName
        .split(' ')
        .join('-')
        .toLowerCase()
      await this.vendorRepository.findOneAndUpdate(
        { phone: vendorsWithoutFriendlyUrlElement.phone },
        { friendlyId }
      )
    }
  }

  async register (data: CreateVendorDto): Promise<ResponseWithStatus> {
    data.phone = internationalisePhoneNumber(data.phone)
    // Validation gate to check if vendor with the request phone is already exist
    const existingUser: Vendor | null = await this.vendorRepository.findOne({
      $or: [{ phone: data.phone }, { email: data.email }]
    })

    if (existingUser !== null) {
      if (existingUser.email.toLowerCase() === data.email.toLowerCase()) {
        throw new FitRpcException(
          'Email already registered. You can reset your password if forgotten',
          HttpStatus.CONFLICT
        )
      }

      if (existingUser.phone === data.phone) {
        throw new FitRpcException(
          'Phone number already registered. You can reset your password if forgotten',
          HttpStatus.CONFLICT
        )
      }
    }

    const friendlyId = data.businessName.split(' ').join('-').toLowerCase()

    const payload: Partial<Vendor> = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      status: 'ONLINE',
      acc_status: VendorApprovalStatus.PENDING,
      friendlyId
    }

    const brevoPayload: CreateBrevoContact = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      businessName: data.businessName
    }
    try {
      await this.vendorRepository.create(payload)
      await this.brevoClient.createContactVendor(brevoPayload, 4)
      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error({
        message: 'Failed to register you at this moment',
        error
      })
      throw new FitRpcException(
        'Failed to register you at this moment. please check your input values',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async validateVendor ({
    email,
    password
  }: LoginVendorRequest): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOneAndPopulate<Vendor>(
      {
        email,
        isDeleted: false
      },
      ['settings']
    )

    if (vendor === null) {
      throw new FitRpcException(
        'Incorrect email address. Please recheck and try again',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      vendor.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Incorrect password. Please recheck and try again',
        HttpStatus.UNAUTHORIZED
      )
    }

    const slackMessage = `Vendor ${vendor.firstName} ${vendor.lastName} signed in with phone number: ${vendor.phone}`
    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.SEND_SLACK_MESSAGE, {
        text: slackMessage
      })
    )

    vendor.password = ''
    return vendor
  }

  async updateVendorStatus ({
    id,
    status
  }: UpdateVendorStatus): Promise<ResponseWithStatus> {
    const updateRequest = await this.vendorRepository.findOneAndUpdate(
      { _id: id },
      { status }
    )

    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to update user. Incorrect input',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  async approve (id: string): Promise<ResponseWithStatus> {
    const updateRequest: Vendor = await this.vendorRepository.findOneAndUpdate(
      { _id: id },
      { acc_status: VendorApprovalStatus.APPROVED, rejection_reason: '' }
    )

    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to approve vendor',
        HttpStatus.BAD_REQUEST
      )
    }

    const notificationSubCreatePayload: SendApprovalPushNotification = {
      vendor: id,
      token: updateRequest.expoNotificationToken
    }
    await lastValueFrom(
      this.notificationClient.emit(
        QUEUE_MESSAGE.CREATE_VENDOR_NOTIFICATION,
        notificationSubCreatePayload
      )
    )
    return { status: 1 }
  }

  async disapprove (id: string, reason: string): Promise<ResponseWithStatus> {
    const updateRequest = await this.vendorRepository.findOneAndUpdate(
      { _id: id },
      {
        rejection_reason: reason,
        acc_status: VendorApprovalStatus.DISAPPROVED
      }
    )

    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to reject vendor',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  async getVendor (_id: string): Promise<Vendor> {
    const _vendor = await this.vendorRepository.findOneAndPopulate<Vendor>(
      {
        _id,
        isDeleted: false
      },
      ['settings']
    )

    if (_vendor === null) {
      throw new FitRpcException(
        `Provided vendor id is not found: ${_id}`,
        HttpStatus.UNAUTHORIZED
      )
    }
    _vendor.password = ''
    return _vendor
  }

  async adminMetrics (): Promise<VendorStatI> {
    const today = new Date()
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(month)
    monthStart.setHours(0, 0, 0, 0)

    const [
      aggregateResult,
      acceptedVendors,
      rejectedVendors,
      weeklySignup,
      monthlySignup
    ] = await Promise.all([
      this.vendorRepository.findRaw().aggregate([
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalVendors: { $sum: 1 }
          }
        }
      ]),

      this.vendorRepository.findRaw().aggregate([
        {
          $match: {
            acc_status: VendorApprovalStatus.APPROVED
          }
        },
        {
          $group: {
            _id: null,
            totalApprovedVendors: { $sum: 1 }
          }
        }
      ]),

      this.vendorRepository.findRaw().aggregate([
        {
          $match: {
            acc_status: VendorApprovalStatus.DISAPPROVED
          }
        },
        {
          $group: {
            _id: null,
            totalRejectedVendors: { $sum: 1 }
          }
        }
      ]),

      this.vendorRepository.findRaw().countDocuments({
        createdAt: {
          $gte: weekStart.toISOString(),
          $lt: today.toISOString()
        }
      }),

      this.vendorRepository.findRaw().countDocuments({
        createdAt: {
          $gte: monthStart.toISOString(),
          $lt: today.toISOString()
        }
      })
    ])
    return {
      aggregateResult: arrayParser<number>(aggregateResult, 'totalVendors'),
      acceptedVendors: arrayParser<number>(
        acceptedVendors,
        'totalApprovedVendors'
      ),
      rejectedVendors: arrayParser<number>(
        rejectedVendors,
        'totalRejectedVendors'
      ),
      weeklySignup,
      monthlySignup
    }
  }

  async updateVendorProfile ({
    data,
    userId
  }: ServicePayload<Partial<Vendor>>): Promise<ResponseWithStatus> {
    const req = await this.vendorRepository.findOneAndUpdate(
      { _id: userId },
      { ...data }
    )

    if (req === null) {
      throw new FitRpcException(
        'Failed to update vendor profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async deleteVendorProfile (vendorId: string): Promise<ResponseWithStatus> {
    const deleteRequest = await this.vendorRepository.upsert(
      { _id: vendorId },
      { isDeleted: true }
    )

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete vendor. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async getAllVendors (): Promise<VendorI[]> {
    const getRequest = await this.vendorRepository.findAndPopulate<VendorI>(
      { isDeleted: false },
      ['settings', 'reviews']
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorsUser (): Promise<VendorI[]> {
    const _vendors: any = await this.vendorRepository.findAndPopulate(
      { isDeleted: false, acc_status: VendorApprovalStatus.APPROVED },
      ['settings', 'reviews']
    )
    if (_vendors === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }

    return _vendors
  }

  async updateSettings (
    data: UpdateVendorSettingsDto,
    vendor: string
  ): Promise<ResponseWithStatus> {
    try {
      await this.vendorSettingsRepository.findOneAndUpdate(
        { vendor },
        { ...data }
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        error,
        message: 'Failed to update vendor settings'
      })
      throw new FitRpcException(
        'Can not update settings at this time. Something went wrong',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getVendorSettings (vendorId: string): Promise<VendorSettings> {
    this.logger.log('PIM -> Fetching vendors settings')
    try {
      return await this.vendorSettingsRepository.findOne({ vendor: vendorId })
    } catch (e) {
      throw new FitRpcException(
        'can not fetch vendors settings at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async createVendorSettings (
    data: any,
    vendor: string
  ): Promise<ResponseWithStatus> {
    try {
      const newSettings = await this.vendorSettingsRepository.create({
        ...data,
        vendor
      })

      await this.vendorRepository.findOneAndUpdate(
        { _id: newSettings.vendor },
        { settings: newSettings._id }
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        error,
        message: `failed to create vendor settings for vendor ${vendor}`
      })
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async updateVendorLogo (data: any, _id: string): Promise<void> {
    try {
      await this.vendorRepository.findOneAndUpdate(
        { _id },
        { businessLogo: data }
      )
    } catch (e) {
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async updateVendorImage (data: any, _id: string): Promise<void> {
    try {
      await this.vendorRepository.findOneAndUpdate(
        { _id },
        { restaurantImage: data }
      )
    } catch (e) {
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async getNearestVendors ({
    type,
    coordinates
  }: LocationCoordinates): Promise<any[]> {
    this.logger.log('PIM -> fetching nearest vendors')
    try {
      const vendors: any = this.vendorRepository.findAndPopulate(
        {
          location: {
            $near: {
              $geometry: {
                type,
                coordinates
              },
              $minDistance: 200,
              $maxDistance: 4000
            }
          }
        },
        ['settings', 'reviews']
      )
      return vendors
    } catch (error) {
      this.logger.log({
        error,
        message: 'Failed to fetch nearest location for user'
      })
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async getVendorsForHomepage (): Promise<VendorServiceHomePageResult> {
    try {
      const allVendors: any[] = await this.vendorRepository.findAndPopulate(
        { acc_status: VendorApprovalStatus.APPROVED },
        ['settings', 'reviews']
      )
      const filteredVendors = allVendors.filter((v: any) => v.review !== null)
      return {
        nearest: [],
        allVendors: filteredVendors
      }
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      throw new FitRpcException(
        'Something went wrong fetching vendors for homepage',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getVendorsListingsPage (
    friendlyId: string
  ): Promise<VendorWithListingsI> {
    try {
      const vendor: VendorI = await this.vendorRepository.findOneAndPopulate(
        { friendlyId },
        ['settings', 'reviews']
      )
      if (vendor === null) {
        throw new FitRpcException(
          'Vendor with that id does not exist',
          HttpStatus.NOT_FOUND
        )
      }

      const listingPayload: MultiPurposeServicePayload<{ vendorId: string }> = {
        id: '',
        data: { vendorId: vendor._id.toString() }
      }
      const vendorListing = await lastValueFrom<ListingMenuI[]>(
        this.listingsClient.send(
          QUEUE_MESSAGE.GET_WEBAPP_VENDOR_WITH_LISTING,
          listingPayload
        )
      )
      return {
        ...vendor,
        listings: vendorListing
      }
    } catch (error) {
      this.logger.log(error)
      throw new FitRpcException(
        'Something went wrong fetching vendors for web app',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateVendorReview (data: UpdateVendorReviewDto): Promise<void> {
    try {
      const vendor = await this.vendorRepository.findOne({ _id: data.vendor })
      await this.vendorRepository.findOneAndUpdate(
        { _id: vendor._id },
        { reviews: [...vendor.reviews, data.reviewId] }
      )
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong updating vendor review',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}

// @TODO(siradji) fully implement the mapping feature
// function getVendorsMapper (vendors: any[]): VendorUserI[] {
//   return vendors.map((vendor: any) => {
//     return {
//       _id: vendor._id,
//       businessName: vendor.businessName,
//       businessAddress: vendor.businessAddress,
//       businessLogo: vendor.businessLogo,
//       isValidated: vendor.isValidated,
//       status: vendor.status,
//       location: vendor.location,
//       businessImage: vendor.restaurantImage,
//       settings: vendor.settings.operations,
//       reviews: vendor.reviews,
//       ratings: {
//         rating: 0,
//         totalReviews: 0
//       }
//     }
//   })
// }
