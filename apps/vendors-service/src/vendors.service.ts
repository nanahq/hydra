import { HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import {
  FitRpcException,
  LoginVendorRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  UpdateVendorStatus
} from '@app/common'
import {
  CreateVendorDto,
  UpdateVendorSettingsDto,
  VendorUserI
} from '@app/common/database/dto/vendor.dto'
import {
  VendorRepository,
  VendorSettingsRepository
} from './vendors.repository'
import { Vendor } from '@app/common/database/schemas/vendor.schema'
import { VendorSettings } from '@app/common/database/schemas/vendor-settings.schema'

@Injectable()
export class VendorsService {
  constructor (
    private readonly vendorRepository: VendorRepository,
    private readonly vendorSettingsRepository: VendorSettingsRepository
  ) {}

  async register (data: CreateVendorDto): Promise<ResponseWithStatus> {
    // Validation gate to check if vendor with the requet phone is already exist
    const existingUser = await this.vendorRepository.findOne({
      businessEmail: data.businessEmail
    })

    if (existingUser !== null) {
      throw new FitRpcException(
        'Email already registered. You can reset your password if forgotten',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
    try {
      await this.vendorRepository.create(data)
      return { status: 1 }
    } catch (error) {
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
    const vendor = await this.vendorRepository.findOne({ businessEmail })

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

  async getVendor ({ userId: _id }: TokenPayload): Promise<Vendor> {
    const _vendor = await this.vendorRepository.findOne({ _id })

    if (_vendor === null) {
      throw new FitRpcException(
        'Provided vendor id is not found',
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
    const deleteRequest = await this.vendorRepository.delete(vendorId as any)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete vendor. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async getAllVendors (): Promise<Vendor[]> {
    const getRequest = await this.vendorRepository.find({})

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorsUser (): Promise<VendorUserI[]> {
    const _vendors = await this.vendorRepository.find({})

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
    _id: string
  ): Promise<ResponseWithStatus> {
    try {
      await this.vendorSettingsRepository.upsert({ vendorId: _id }, { data })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update settings at this time. Something went wrong',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getVendorSettings (vendorId: string): Promise<VendorSettings> {
    try {
      const req = await this.vendorSettingsRepository.findOne({ vendorId })
      if (req === null) {
        throw new Error()
      }
      return req
    } catch (e) {
      throw new FitRpcException(
        'can not fetch vendors settings at this time',
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}

function getVendorsMapper (vendors: any[]): any[] {
  const map = vendors.map((vendor) => {
    return {
      businessName: vendor.businessName,
      businessAddress: vendor.businessAddress,
      businessLogo: vendor.businessLogo,
      isValidated: vendor.isValidated,
      status: vendor.status,
      location: vendor.location
    }
  })
  return map
}
