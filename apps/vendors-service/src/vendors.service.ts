import { HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import {
  FitRpcException,
  LoginVendorRequest,
  ResponseWithStatus,
  ServicePayload,
  UpdateVendorStatus,
  VendorUserI
} from '@app/common'
import {
  CreateVendorDto,
  UpdateVendorSettingsDto
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
        HttpStatus.CONFLICT
      )
    }

    const payload: Partial<Vendor> = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      status: 'ONLINE'
    }

    try {
      await this.vendorRepository.create(payload)
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
    const vendor = await this.vendorRepository.findOneAndPopulate({
      businessEmail,
      isDeleted: false
    }, 'settings')

    if (vendor === null) {
      throw new FitRpcException(
        'Incorrect email address. Please recheck and try again',
        HttpStatus.CONFLICT
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

  async getVendor (_id: string): Promise<Vendor> {
    const _vendor = await this.vendorRepository.findOneAndPopulate({
      _id,
      isDeleted: false
    }, 'settings')

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

  async getAllVendors (): Promise<Vendor[]> {
    const getRequest = await this.vendorRepository.find({ isDeleted: false })

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorsUser (): Promise<VendorUserI[]> {
    const _vendors = await this.vendorRepository.find({ isDeleted: false })

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
      await this.vendorSettingsRepository.findOneAndUpdate(
        { vendorId: _id },
        { ...data }
      )
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

  async createVendorSettings (data: any, vendorId: string): Promise<ResponseWithStatus> {
    try {
      const newSettings = await this.vendorSettingsRepository.create({ ...data, vendorId })
      await this.vendorRepository.findOneAndUpdate({ _id: newSettings.vendorId }, { settings: newSettings._id })
      return { status: 1 }
    } catch (e) {
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  async updateVendorLogo (data: any, _id: string): Promise<void> {
    try {
      await this.vendorRepository.findOneAndUpdate({ _id }, { businessLogo: data })
    } catch (e) {
      throw new FitRpcException(
        'Failed to create  settings',
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}

function getVendorsMapper (vendors: any[]): VendorUserI[] {
  return vendors.map((vendor) => {
    return {
      businessName: vendor.businessName,
      businessAddress: vendor.businessAddress,
      businessLogo: vendor.businessLogo,
      isValidated: vendor.isValidated,
      status: vendor.status,
      location: vendor.location
    }
  })
}
