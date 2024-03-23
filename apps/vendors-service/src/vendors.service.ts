import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import {
  FitRpcException,
  LocationCoordinates,
  LoginVendorRequest,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  SendApprovalPushNotification,
  ServicePayload,
  UpdateVendorStatus,
  VendorApprovalStatus,
  VendorI,
  VendorServiceHomePageResult,
  VendorUserI
} from '@app/common'
import { CreateVendorDto, UpdateVendorSettingsDto } from '@app/common/database/dto/vendor.dto'

import { VendorRepository, VendorSettingsRepository } from './vendors.repository'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'
import { internationalisePhoneNumber } from '@app/common/utils/phone.number'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { UpdateVendorReviewDto } from '@app/common/dto/General.dto'

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name)

  constructor (
    private readonly vendorRepository: VendorRepository,
    private readonly vendorSettingsRepository: VendorSettingsRepository,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

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

    const payload: Partial<Vendor> = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      status: 'ONLINE',
      acc_status: VendorApprovalStatus.PENDING
    }

    try {
      await this.vendorRepository.create(payload)
      return { status: 1 }
    } catch (error) {
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
    businessEmail,
    password
  }: LoginVendorRequest): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOneAndPopulate<Vendor>(
      {
        businessEmail,
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
      ['settings']
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorsUser (): Promise<VendorUserI[]> {
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

    return getVendorsMapper(_vendors)
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

  async getVendorsForHomepage (
    userLocation: LocationCoordinates
  ): Promise<VendorServiceHomePageResult> {
    try {
      const nearest = await this.getNearestVendors(userLocation)
      const allVendors: any = await this.vendorRepository.findAndPopulate(
        { acc_status: VendorApprovalStatus.APPROVED },
        ['settings', 'reviews']
      )
      return {
        nearest,
        allVendors
      }
    } catch (error) {
      this.logger.log(error)
      throw new FitRpcException(
        'Something went wrong fetching vendors for homepage',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateVendorReview (data: UpdateVendorReviewDto): Promise<void> {
    try {
      const vendor = await this.vendorRepository.findOne({ _id: data.vendor })
      await this.vendorRepository.findOneAndUpdate({ _id: vendor._id }, { reviews: [...vendor.reviews, data.reviewId] })
    } catch (error) {
      throw new FitRpcException('Something went wrong updating vendor review', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

function getVendorsMapper (vendors: any[]): VendorUserI[] {
  return vendors.map((vendor: any) => {
    return {
      _id: vendor._id,
      businessName: vendor.businessName,
      businessAddress: vendor.businessAddress,
      businessLogo: vendor.businessLogo,
      isValidated: vendor.isValidated,
      status: vendor.status,
      location: vendor.location,
      businessImage: vendor.restaurantImage,
      settings: vendor.settings.operations,
      ratings: {
        rating: 0,
        totalReviews: 0
      }
    }
  })
}
