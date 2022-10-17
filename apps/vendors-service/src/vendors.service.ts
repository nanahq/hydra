import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm'

import * as bcrypt from 'bcrypt'

import {
  FitRpcException,
  loginUserRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  updateVendorStatus,
  VendorDto,
  VendorEntity
} from '@app/common'

@Injectable()
export class VendorsService {
  constructor (
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>
  ) {}

  async register (data: VendorDto): Promise<ResponseWithStatus> {
    await this.checkExistingVendor(data.businessPhoneNumber) // Validation gate to check if vendor with the requet phone is already exist
    const payload = {
      ...data,
      password: await bcrypt.hash(data.password, 10)
    }
    const createVendorRequest = await this.createVendor(payload)

    if (createVendorRequest === null) {
      throw new FitRpcException(
        'Failed to register you at this moment. please check your input values',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  async validateVendor ({
    phoneNumber,
    password
  }: loginUserRequest): Promise<VendorEntity> {
    const vendor = await this.getVendorByPhone(phoneNumber)
    if (vendor === null) {
      throw new FitRpcException(
        'Provided phone number is not correct',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      vendor.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    vendor.password = ''
    return vendor
  }

  async updateVendorStatus (
    data: updateVendorStatus
  ): Promise<ResponseWithStatus> {
    const updateRequest = await this.updateVendorApprovalStatus(data)
    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to update user. Incorrect input',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  async getVendor ({ userId }: TokenPayload): Promise<VendorEntity> {
    const _vendor = await this.getVendorById(userId)

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
  }: ServicePayload<Partial<VendorEntity>>): Promise<ResponseWithStatus> {
    const req = await this.updateProfile(data, userId)

    if (req === null) {
      throw new FitRpcException(
        'Failed to update vendor profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async deleteVendorProfile (vendorId: string): Promise<ResponseWithStatus> {
    const deleteRequest = await this.deleteVendor(vendorId)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete vendor. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async getAllVendors (): Promise<VendorEntity[]> {
    const getRequest = await this.getVendors()

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorsUser (): Promise<VendorEntity[]> {
    const getRequest = await this.getVendorsUsers()

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all vendors.',
        HttpStatus.BAD_REQUEST
      )
    }

    return getRequest
  }

  private async checkExistingVendor (phoneNumber: string): Promise<void> {
    const vendor = await this.getVendorByPhone(phoneNumber)
    if (vendor !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  private async createVendor (vendor: VendorDto): Promise<InsertResult | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .insert()
      .into(VendorEntity)
      .values({ ...vendor })
      .returning('id')
      .execute()
  }

  private async getVendorByPhone (phone: string): Promise<VendorEntity | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.businessPhoneNumber = :phone', { phone })
      .addSelect('vendor.password')
      .getOne()
  }

  private async getVendorById (id: string): Promise<VendorEntity | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.id = :id', { id })
      .getOne()
  }

  private async updateVendorApprovalStatus (
    payload: updateVendorStatus
  ): Promise<UpdateResult | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .update(VendorEntity)
      .set({
        approvalStatus: payload.status
      })
      .where('vendor.id = :id', { id: payload.id })
      .execute()
  }

  private async updateProfile (
    data: Partial<VendorEntity>,
    id: string
  ): Promise<UpdateResult | null> {
    return await this.vendorRepository
      .createQueryBuilder()
      .update(VendorEntity)
      .set({
        ...data
      })
      .where('id = :id', { id })
      .returning('id')
      .execute()
  }

  private async deleteVendor (id: string): Promise<DeleteResult | null> {
    return await this.vendorRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute()
  }

  private async getVendors (): Promise<VendorEntity[] | null> {
    return await this.vendorRepository.createQueryBuilder('vendor').getMany()
  }

  private async getVendorsUsers (): Promise<VendorEntity[] | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .select(['vendor.id', 'vendor.state', 'vendor.businessName'])
      .getMany()
  }
}
