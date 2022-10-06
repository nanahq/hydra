import { HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UpdateUserStateResponse } from './interface'
import { loginUserRequest, TokenPayload } from '@app/common'
import { FitRpcException } from '@app/common/filters/rpc.expection'
import { InjectRepository } from '@nestjs/typeorm'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { VendorDto } from '@app/common/database/dto/vendor.dto'
import { updateVendorStatus } from '@app/common/dto/UpdateVendorStatus.dto'
import { DeleteResult, Repository } from 'typeorm'
import { nanoid } from 'nanoid'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'

@Injectable()
export class VendorsService {
  constructor (
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: Repository<VendorEntity>
  ) {}

  async register (data: VendorDto): Promise<string> {
    await this.checkExistingVendor(data.businessPhoneNumber) // Validation gate to check if vendor with the requet phone is already exist
    const payload = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      id: nanoid()
    }
    try {
      return await this.createVendor(payload)
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong. Could not register you at the moment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
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
  ): Promise<UpdateUserStateResponse> {
    try {
      await this.updateVendorApprovalStatus(data)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Something Went Wrong Updating User status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getVendor ({ userId }: TokenPayload): Promise<VendorEntity> {
    const _vendor = await this.getVendorById(userId)
    if (_vendor === null) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
    _vendor.password = ''

    return _vendor
  }

  async updateVendorProfile ({
    data,
    userId
  }: ServicePayload<Partial<VendorEntity>>): Promise<string> {
    const req = await this.updateProfile(data, userId)
    if (req === null) {
      throw new FitRpcException(
        'Failed to update vendor profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return req
  }

  async deleteVendorProfile (vendorId: string): Promise<{ status: number }> {
    const deleteRequest = await this.deleteVendor(vendorId)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete vendor. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  private async checkExistingVendor (phoneNumber: string): Promise<void> {
    const vendor = await this.getVendorByPhone(phoneNumber)
    if (vendor !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  private async createVendor (vendor: VendorDto): Promise<string> {
    const query = await this.vendorRepository
      .createQueryBuilder('vendor')
      .insert()
      .into(VendorEntity)
      .values({ ...vendor })
      .returning('id')
      .execute()
    return query.identifiers[0].id as unknown as string
  }

  private async getVendorByPhone (phone: string): Promise<VendorEntity | null> {
    return await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.businessPhoneNumber = :phone', { phone })
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
  ): Promise<string | null> {
    const query = await this.vendorRepository
      .createQueryBuilder('vendor')
      .update(VendorEntity)
      .set({
        approvalStatus: () => payload.status
      })
      .where('vendor.id = :id', { id: payload.id })
      .returning('id')
      .execute()

    return query.raw[0].id
  }

  private async updateProfile (
    data: Partial<VendorEntity>,
    id: string
  ): Promise<string | null> {
    const query = await this.vendorRepository
      .createQueryBuilder()
      .update(VendorEntity)
      .set({
        ...data
      })
      .where('id = :id', { id })
      .returning('id')
      .execute()
    return query === null ? query : (query.raw[0].id as string)
  }

  private async deleteVendor (id: string): Promise<DeleteResult | null> {
    return await this.vendorRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute()
  }
}
