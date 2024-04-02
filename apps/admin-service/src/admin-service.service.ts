import { HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import {
  Admin,
  FitRpcException,
  MultiPurposeServicePayload,
  RegisterAdminDTO,
  ResponseWithStatus,
  UpdateAdminLevelRequestDto
} from '@app/common'
import { AdminRepository } from './admin.repository'

@Injectable()
export class AdminServiceService {
  constructor (public readonly adminRepository: AdminRepository) {}

  public async createAdmin (
    data: RegisterAdminDTO
  ): Promise<ResponseWithStatus> {
    const payload = {
      ...data,
      userName: data.userName.toLowerCase(),
      password: await bcrypt.hash(data.password, 10)
    }

    const existingAdmin: Admin = await this.adminRepository.findOne({ userName: payload.userName })

    if (existingAdmin !== null) {
      throw new FitRpcException(
        'Username already exists.',
        HttpStatus.CONFLICT
      )
    }

    try {
      await this.adminRepository.create(payload)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async validateAdminWithPassword ({
    userName,
    password
  }: {
    userName: string
    password: string
  }): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ userName })

    if (admin === null) {
      throw new FitRpcException(
        'Provided username is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      admin.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    admin.password = ''

    return admin
  }

  public async validateAdminWithId (_id: string): Promise<Admin> {
    const getAdminByIdRequest = await this.adminRepository.findOne({ _id })

    if (getAdminByIdRequest === null) {
      throw new FitRpcException(
        'Can not find Admin with the provided ID',
        HttpStatus.UNAUTHORIZED
      )
    }
    getAdminByIdRequest.password = ''
    return getAdminByIdRequest
  }

  public async changeAdminAccess (
    data: UpdateAdminLevelRequestDto
  ): Promise<ResponseWithStatus> {
    const changeAdminAccessRequest =
      await this.adminRepository.findOneAndUpdate(
        { _id: data.id },
        { level: data.level }
      )

    if (changeAdminAccessRequest === null) {
      throw new FitRpcException(
        'Failed to update admin level. admin with id not found',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  public async deleteAdminProfile (id: any): Promise<ResponseWithStatus> {
    const deleteRequest = await this.adminRepository.delete(id)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete admin. Id is not correct',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  public async resetAdminPassword ({ id, data }: MultiPurposeServicePayload<string>):
  Promise<ResponseWithStatus> {
    const newPassword: string = await bcrypt.hash(data, 10)
    await this.adminRepository.findOneAndUpdate(
      { _id: id },
      { password: newPassword }
    )

    return { status: 1 }
  }

  async getAllAdmins (): Promise<Admin[]> {
    const getRequest = await this.adminRepository.find({})

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all admins.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }
}
