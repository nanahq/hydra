import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm'
import * as bcrypt from 'bcrypt'

import {
  ResponseWithStatus,
  UpdateAdminLevelRequestDto,
  FitRpcException,
  RegisterAdminDTO,
  AdminEntity
} from '@app/common'

@Injectable()
export class AdminServiceService {
  constructor (
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>
  ) {}

  public async createAdmin (
    data: RegisterAdminDTO
  ): Promise<ResponseWithStatus> {
    const payload = {
      ...data,
      password: await bcrypt.hash(data.password, 10)
    }

    const createAdminRequest = await this.create(payload)

    if (createAdminRequest === null) {
      throw new FitRpcException(
        'Failed to create admin. Check submitted values',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  public async validateAdminWithPassword ({
    userName,
    password
  }: {
    userName: string
    password: string
  }): Promise<AdminEntity> {
    const adminRequest = await this.getAdminByUserName(userName)

    if (adminRequest === null) {
      throw new FitRpcException(
        'Provided username is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      adminRequest.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    adminRequest.password = ''

    return adminRequest
  }

  public async validateAdminWithId (id: string): Promise<AdminEntity> {
    const getAdminByIdRequest = await this.getAdminById(id)

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
    const changeAdminAccessRequest = await this.updateAdminLevel(data)

    if (changeAdminAccessRequest === null) {
      throw new FitRpcException(
        'Failed to update admin level. admin with id not found',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  public async deleteAdminProfile (id: string): Promise<ResponseWithStatus> {
    const deleteRequest = await this.deleteAdmin(id)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete admin. Id is not correct',
        HttpStatus.BAD_REQUEST
      )
    }
    return { status: 1 }
  }

  private async create (
    data: Partial<AdminEntity>
  ): Promise<InsertResult | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .insert()
      .into(AdminEntity)
      .values({ ...data })
      .returning('id')
      .execute()
  }

  private async getAdminByUserName (
    userName: string
  ): Promise<AdminEntity | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.userName = :userName', { userName })
      .addSelect('admin.password')
      .getOne()
  }

  private async getAdminById (id: string): Promise<AdminEntity | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.id = :id', { id })
      .getOne()
  }

  private async updateAdminLevel (
    data: UpdateAdminLevelRequestDto
  ): Promise<UpdateResult | null> {
    return await this.adminRepository
      .createQueryBuilder()
      .update(AdminEntity)
      .set({
        ...data
      })
      .where('id = :id', { id: data.id })
      .execute()
  }

  private async deleteAdmin (id: string): Promise<DeleteResult | null> {
    return await this.adminRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute()
  }
}
