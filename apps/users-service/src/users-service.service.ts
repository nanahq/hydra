import {
  Inject,
  Injectable,
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
@Injectable()
export class UsersServiceService {
  constructor (
    private readonly usersRepository: UsersRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  async register ({ phoneNumber, password }: registerUserRequest): Promise<User> {
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

  async updateUserStatus ({
    phoneNumber
  }: verifyPhoneRequest): Promise<UpdateUserStateResponse> {
    await this.usersRepository.findOneAndUpdate({ phoneNumber }, { status: 1 })
    return { status: 1 }
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
