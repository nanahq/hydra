import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { registerUserRequest } from '@app/common/dto/registerUser.dto'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Body,
  Controller,
  Inject,
  Post,
  UnprocessableEntityException
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@Controller('/users')
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE) private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  @Post('/register')
  async registerNewUser (@Body() request: registerUserRequest): Promise<any> {
    try {
      const newUser = await lastValueFrom(
        this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request })
      )
      return newUser
    } catch (error) {
      throw new UnprocessableEntityException(error)
    }
  }

  @Post('/verify')
  async verifyUser (@Body() request: PhoneVerificationPayload): Promise<any> {
    try {
      return await lastValueFrom(
        this.notificationClient.send(QUEUE_MESSAGE.VERIFY_PHONE, {
          ...request
        })
      )
    } catch (error) {
      throw new UnprocessableEntityException(error)
    }
  }
}
