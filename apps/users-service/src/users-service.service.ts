import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import {
  CheckUserAccountI,
  FitRpcException, internationalisePhoneNumber,
  loginUserRequest, QUEUE_MESSAGE, QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  User,
  verifyPhoneRequest
} from '@app/common'
import { UserRepository } from './users.repository'
import { UpdateUserDto } from '@app/common/dto/UpdateUserDto'
import { lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class UsersService {
  private readonly logger = new Logger()
  constructor (
    private readonly usersRepository: UserRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  async register ({
    email,
    phone,
    password
  }: registerUserRequest): Promise<User> {
    const formattedPhone = internationalisePhoneNumber(phone)
    await this.checkExistingUser(formattedPhone, email) // Gate to check if phone has already been registered

    const payload: Partial<User> = {
      email,
      phone: formattedPhone,
      password: await bcrypt.hash(password, 10),
      isValidated: false
    }

    try {
      const user = await this.usersRepository.create(payload)
      await lastValueFrom(
        this.notificationClient.emit(
          QUEUE_MESSAGE.SEND_PHONE_VERIFICATION,
          {
            email,
            phone,
            password
          }
        )
      )
      return user
    } catch (error) {
      throw new FitRpcException(
        `can not process request. Try again later ${JSON.stringify(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async resendPhoneNumberRequest (phone: string): Promise<ResponseWithStatus> {
    const user: User | null = await this.usersRepository.findOne({ phone })

    if (user === null) {
      throw new FitRpcException('User with that phone number does not exist', HttpStatus.NOT_FOUND)
    }

    if (user.isValidated) {
      throw new FitRpcException('Phone number has been verified', HttpStatus.BAD_REQUEST)
    }

    await lastValueFrom(
      this.notificationClient.emit(
        QUEUE_MESSAGE.SEND_PHONE_VERIFICATION,
        { phone }
      )
    )

    return { status: 1 }
  }

  async validateUser ({
    phone,
    password
  }: loginUserRequest): Promise<{ status: number, data: User }> {
    const validateUserRequest: User = await this.usersRepository.findOne({ phone })

    if (validateUserRequest === null) {
      throw new FitRpcException('User with that phone number does not exist', HttpStatus.NOT_FOUND)
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

    if (!validateUserRequest.isValidated) {
      await lastValueFrom(
        this.notificationClient.emit(
          QUEUE_MESSAGE.SEND_PHONE_VERIFICATION,
          { phone: validateUserRequest.phone }
        )
      )
      throw new FitRpcException(
        'Verify phone number',
        HttpStatus.FORBIDDEN
      )
    }

    validateUserRequest.password = ''
    return {
      status: 1,
      data: validateUserRequest
    }
  }

  async updateUserStatus ({
    phone
  }: verifyPhoneRequest): Promise<ResponseWithStatus> {
    try {
      await this.usersRepository.findOneAndUpdate(
        { phone },
        { isValidated: true }
      )
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
    } catch (error) {
      this.logger.log({
        error,
        message: `PIM -> failed to update user ${userId}`
      })
      throw new FitRpcException(
        'Failed to update user profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUser ({ userId }: TokenPayload): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        _id: userId,
        isDeleted: false
      })
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
    await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { isDeleted: true }
    )
    return { status: 1 }
  }

  public async getUserWithPhone (phone: string): Promise<User> {
    const _user = await this.usersRepository.findOne({
      phone,
      isDeleted: false
    })

    if (_user === null) {
      throw new FitRpcException(
        'User not with the phone number not found',
        HttpStatus.NOT_FOUND
      )
    }

    _user.password = ''
    return _user
  }

  public async updateUserOrderCount (
    orderId: string,
    userId: string
  ): Promise<ResponseWithStatus> {
    const user = (await this.usersRepository.findOne({ _id: userId })) as User
    await this.usersRepository.findOneAndUpdate(
      { _id: user?._id },
      { orders: [...user?.orders, orderId] }
    )
    return { status: 1 }
  }

  public async checkUserAccount (phone: string): Promise<CheckUserAccountI> {
    const user: User | null = await this.usersRepository.findOne({ phone })
    if (user === null) {
      return {
        hasAccount: false,
        firstName: undefined
      }
    }
    return {
      hasAccount: true,
      firstName: user.firstName
    }
  }

  private async checkExistingUser (phone: string, email: string): Promise<User> {
    const _phone: User | null = await this.usersRepository.findOne({ phone })

    const _email: User | null = await this.usersRepository.findOne({ email })

    if (_phone !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.CONFLICT
      )
    }

    if (_email !== null) {
      throw new FitRpcException(
        'Email is  already registered.',
        HttpStatus.CONFLICT
      )
    }
    return _phone as unknown as User
  }
}
