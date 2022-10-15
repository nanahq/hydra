import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm'

import * as bcrypt from 'bcrypt'

import {
  FitRpcException,
  loginUserRequest,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  UserDto,
  UserEntity,
  verifyPhoneRequest
} from '@app/common'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async register ({
    phoneNumber,
    password
  }: registerUserRequest): Promise<ResponseWithStatus> {
    await this.checkExistingUser(phoneNumber)

    const payload = {
      phoneNumber,
      password: await bcrypt.hash(password, 10),
      firstName: '',
      lastName: '',
      state: '',
      status: 0,
      addresses: ['']
    }
    const _user = await this.createUser(payload)

    if (_user === null) {
      throw new FitRpcException(
        'Failed to create new user. please check your input',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  async validateUser ({
    phoneNumber,
    password
  }: loginUserRequest): Promise<UserEntity> {
    const validateUserRequest = await this.getUserByPhone(phoneNumber)

    if (validateUserRequest == null) {
      throw new FitRpcException(
        'Provided phone number is not correct',
        HttpStatus.UNAUTHORIZED
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      validateUserRequest.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    validateUserRequest.password = ''
    return validateUserRequest
  }

  async updateUserStatus ({
    phoneNumber
  }: verifyPhoneRequest): Promise<ResponseWithStatus> {
    const req = await this.updateStatus(phoneNumber)

    if (req == null) {
      throw new FitRpcException(
        'Failed to update user status',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async updateUserProfile ({
    data,
    userId
  }: ServicePayload<Partial<UserEntity>>): Promise<ResponseWithStatus> {
    const req = await this.updateUser(data, userId)

    if (req === null) {
      throw new FitRpcException(
        'Failed to update user profile',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
    return { status: 1 }
  }

  async getUser ({ userId }: TokenPayload): Promise<UserEntity> {
    const user = await this.getUserById(userId)

    if (user === null) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
    user.password = ''
    return user
  }

  async deleteUserProfile (userId: string): Promise<ResponseWithStatus> {
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

  private async createUser (user: UserDto): Promise<InsertResult | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .insert()
      .into(UserEntity)
      .values({ ...user })
      .returning('id')
      .execute()
  }

  private async getUserByPhone (phone: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phone', { phone })
      .addSelect('user.password')
      .getOne()
  }

  private async getUserById (id: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne()
  }

  private async updateStatus (
    phoneNumber: string
  ): Promise<UpdateResult | null> {
    return await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        status: 1
      })
      .where('phoneNumber = :phoneNumber', { phoneNumber })
      .returning('id')
      .execute()
  }

  private async updateUser (
    user: Partial<UserEntity>,
    id: string
  ): Promise<UpdateResult | null> {
    return await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        ...user
      })
      .where('id = :id', { id })
      .returning('id')
      .execute()
  }

  private async deleteUser (id: string): Promise<DeleteResult | null> {
    return await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .returning('id')
      .execute()
  }
}
