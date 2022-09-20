import {
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common'
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
    try {
      // Validation gate to check if provided phone number is in db
      await this.checkExistingUser(phoneNumber)

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
      throw new UnprocessableEntityException(error)
    }
  }

  async validateUser ({
    phoneNumber,
    password
  }: loginUserRequest): Promise<User> {
    const user = await this.usersRepository.findOne({ phoneNumber })

    if (user == null) {
      throw new UnauthorizedException('Provided Phone is incorrect')
    }
    const isCorrectPassword: boolean = await bcrypt.compare(password, user.password)

    if (!isCorrectPassword) {
      throw new UnauthorizedException('Provided Password is incorrect')
    }
    return user
  }

  async updateUserStatus ({
    phoneNumber
  }: verifyPhoneRequest): Promise<UpdateUserStateResponse> {
    await this.usersRepository.findOneAndUpdate({ phoneNumber }, { status: 1 })
    return { status: 1 }
  }

  async getUser ({ userId }: TokenPayload): Promise<User> {
    const user = await this.usersRepository.findOne({ _id: userId })
    if (user === null) {
      throw new UnauthorizedException('Provided user id is not founf')
    }
    return user
  }

  private async checkExistingUser (phoneNumber: string): Promise<void> {
    const user = await this.usersRepository.findOne({ phoneNumber })
    if (user !== null) {
      throw new UnprocessableEntityException(
        'Phone Number is  already registered.'
      )
    }
  }
}
