import { HttpStatus, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import {
  FitRpcException,
  loginUserRequest,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  User,
  verifyPhoneRequest
} from '@app/common'
import { UserRepository } from './users.repository'
import { UpdateUserDto } from '@app/common/dto/UpdateUserDto'
@Injectable()
export class UsersService {
  constructor (
    private readonly usersRepository: UserRepository
  ) {}

  async register ({
    phone,
    password
  }: registerUserRequest): Promise<ResponseWithStatus> {
   const user =  await this.checkExistingUser(phone) // Gate to check if phone has already been registered

    if (user.isDeleted) {
      return { status: 1 }
    }

    const payload: Partial<User> = {
      phone,
      password: await bcrypt.hash(password, 10),
      isValidated: false
    }

    try {
      await this.usersRepository.create(payload)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async validateUser ({
    phone,
    password
  }: loginUserRequest): Promise<{ status: number, data: User }> {
    const validateUserRequest = await this.usersRepository.findOne({ phone })

    if (validateUserRequest === null) {
      await this.register({ password, phone })
      const data = await this.usersRepository.findOne({ phone }) as User
      return { status: 1, data }
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
    return { status: 2, data: validateUserRequest }
  }

  async updateUserStatus ({
    phone
  }: verifyPhoneRequest): Promise<ResponseWithStatus> {
    try {
      await this.usersRepository.findOneAndUpdate({ phone }, { isValidated: true })
      return { status: 1 }
    } catch {
      throw new FitRpcException(
        'Failed to update user status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateUserProfile ({
    data,
    userId
  }: ServicePayload<Partial<UpdateUserDto>>): Promise<ResponseWithStatus> {
    try {
      await this.usersRepository.findOneAndUpdate({ _id: userId }, { ...data })
      return { status: 1 }
    } catch {
      throw new FitRpcException(
        'Failed to update user status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUser ({ userId }: TokenPayload): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ _id: userId, isDeleted: false })
      if (user === null) {
        throw new Error()
      }
      user.password = ''
      return user
    } catch (error) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
  }

  async deleteUserProfile (userId: string): Promise<ResponseWithStatus> {
    await this.usersRepository.findOneAndUpdate({ _id: userId }, { isDeleted: true })
    return { status: 1 }
  }

  public async getUserWithPhone (phone: string): Promise<User> {
    const _user = await this.usersRepository.findOne({ phone, isDeleted: false })

    if (_user === null) {
      throw new FitRpcException(
        'User not with the phone number not found',
        HttpStatus.NOT_FOUND
      )
    }

    _user.password = ''
    return _user
  }

  public async updateUserOrderCount (orderId: string, userId: string): Promise<ResponseWithStatus> {
    const user = await this.usersRepository.findOne({ _id: userId }) as User
    await this.usersRepository.findOneAndUpdate({ _id: user?._id }, { orders: [...user?.orders, orderId] })
    return { status: 1 }
  }

  private async checkExistingUser (phone: string): Promise<User> {
    const user = await this.usersRepository.findOne({ phone })
    if (user !== null && !user.isDeleted) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.CONFLICT
      )
    }
    return user
  }
}
