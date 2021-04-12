<<<<<<< HEAD
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
=======
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { registerUserRequest } from '@app/common/dto/registerUser.dto'
>>>>>>> 88cba151327f8edbb1cdda62bd2b143a4eadaad4
import * as bcrypt from 'bcrypt'
import { ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { nanoid } from 'nanoid'
import { lastValueFrom } from 'rxjs'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  loginUserRequest,
  TokenPayload,
  UserDto,
  UserEntity,
  registerUserRequest,
  FitRpcException,
  ServicePayload,
  verifyPhoneRequest
} from '@app/common'
<<<<<<< HEAD
=======
import { FitRpcException } from '@app/common/filters/rpc.expection'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeleteResult } from 'typeorm'
import { nanoid } from 'nanoid'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
>>>>>>> 88cba151327f8edbb1cdda62bd2b143a4eadaad4

import { DeleteUserResponse } from './interface'
@Injectable()
<<<<<<< HEAD
export class UsersService {
=======
export class UsersServiceService {
  private readonly logger = new Logger(UsersServiceService.name)
>>>>>>> 88cba151327f8edbb1cdda62bd2b143a4eadaad4
  constructor (
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  async register ({
    phoneNumber,
    password
  }: registerUserRequest): Promise<string> {
    await this.checkExistingUser(phoneNumber)

    try {
      const payload = {
        id: nanoid(),
        phoneNumber,
        password: await bcrypt.hash(password, 10),
        firstName: '',
        lastName: '',
        state: '',
        status: 0,
        addresses: ['']
      }
      this.logger.log('Calling createUser Query')
      const user = await this.createUser(payload)

      await lastValueFrom(
        this.notificationClient.send(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION, {
          phoneNumber
        })
      )
      return user
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong. Could not register you at the moment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async validateUser ({
    phoneNumber,
    password
  }: loginUserRequest): Promise<UserEntity> {
    this.logger.log('Calling validateUser Query')

    const user = await this.getUserByPhone(phoneNumber)

    if (user == null) {
      throw new FitRpcException(
        'Provided phone number is not correct',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      user.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }
    return user
  }

  async updateUserStatus ({
    phoneNumber
  }: verifyPhoneRequest): Promise<null | number> {
    this.logger.log('Calling UpdateUserStatus Query')
    const req = await this.updateStatus(phoneNumber)
    if (req == null) {
      throw new FitRpcException(
        'Failed to update user status',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return req
  }

  async updateUserProfile ({
    data,
    userId
  }: ServicePayload<Partial<UserEntity>>): Promise<string> {
    this.logger.log('Calling UpdateUserProfile Query')
    const req = await this.updateUser(data, userId)
    if (req === null) {
      throw new FitRpcException(
        'Failed to update user profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
    return req
  }

  async getUser ({ userId }: TokenPayload): Promise<UserEntity> {
    this.logger.log('Calling getUser Query')
    const user = await this.getUserById(userId)
    if (user === null) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
    return user
  }

  async deleteUserProfile (userId: string): Promise<{ status: number }> {
    this.logger.log('Calling deleteUserProfile Query')
    const deleteRequest = await this.deleteUser(userId)
    if (deleteRequest === null) {
      throw new FitRpcException(
        'Can not delete user. User does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
    return { status: 1 }
  }

  private async checkExistingUser (phoneNumber: string): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne()
    if (user !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.BAD_GATEWAY
      )
    }
  }

  private async createUser (user: UserDto): Promise<string> {
    const query = await this.usersRepository
      .createQueryBuilder('user')
      .insert()
      .into(UserEntity)
      .values({ ...user })
      .returning('id')
      .execute()
    return query.identifiers[0].id as unknown as string
  }

  private async getUserByPhone (phone: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phone', { phone })
      .getOne()
  }

  private async getUserById (id: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne()
  }

  private async updateStatus (phoneNumber: string): Promise<null | number> {
    const query = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        status: 1
      })
      .where('phoneNumber = :phoneNumber', { phoneNumber })
      .returning('id')
      .execute()

    return query === null ? query : 1
  }

  private async updateUser (
    user: Partial<UserEntity>,
    id: string
  ): Promise<string | null> {
    const query = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        ...user
      })
      .where('id = :id', { id })
      .returning('id')
      .execute()
    return query === null ? query : (query.raw[0].id as string)
  }

<<<<<<< HEAD
  private async deleteEntity (id: string): Promise<any> {
    return await this.usersRepository
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
=======
  private async deleteUser (id: string): Promise<DeleteResult | null> {
    return await this.usersRepository
      .createQueryBuilder()
      .delete()
>>>>>>> 88cba151327f8edbb1cdda62bd2b143a4eadaad4
      .where('id = :id', { id })
      .returning('id')
      .execute()
  }
<<<<<<< HEAD

  async deleteUser (id: string): Promise<DeleteUserResponse> {
    const deleted = await this.deleteEntity(id)

    if (deleted === true) {
      return { status: 1 }
    }
    return { status: 0 }
  }
=======
>>>>>>> 88cba151327f8edbb1cdda62bd2b143a4eadaad4
}
