import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { registerUserRequest } from '@app/common/dto/registerUser.dto'
import { UsersRepository } from './users.repository'
import * as bcrypt from 'bcrypt'
import { User } from './schema'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto'
import { UpdateUserStateResponse } from './interface'
import { loginUserRequest, TokenPayload } from '@app/common'
import { FitRpcException } from '@app/common/filters/rpc.expection'
@Injectable()
export class UsersServiceService {
  constructor (
    private readonly usersRepository: UsersRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  async register ({
    phoneNumber,
    password
  }: registerUserRequest): Promise<User> {
    // Validation gate to check if provided phone number is in db
    await this.checkExistingUser(phoneNumber)

    try {
      const payload: Omit<User, '_id'> = {
        phoneNumber,
        password: await bcrypt.hash(password, 10),
        name: '',
        state: '',
        status: 0
      }
      const user = await this.usersRepository.create(payload)

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
  }: loginUserRequest): Promise<User> {
    const user = await this.usersRepository.findOne({ phoneNumber })

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
  }: verifyPhoneRequest): Promise<UpdateUserStateResponse> {
    try {
      await this.usersRepository.findOneAndUpdate(
        { phoneNumber },
        { status: 1 }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Something Went Wrong Updating User status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUser ({ userId }: TokenPayload): Promise<User> {
    const user = await this.usersRepository.findOne({ _id: userId })
    if (user === null) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
    return user
  }

  private async checkExistingUser (phoneNumber: string): Promise<void> {
    const user = await this.usersRepository.findOne({ phoneNumber })
    if (user !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.BAD_GATEWAY
      )
    }
  }
}
