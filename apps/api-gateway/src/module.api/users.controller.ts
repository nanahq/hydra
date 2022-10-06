import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { registerUserRequest } from '@app/common/dto/registerUser.dto'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'

import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Delete,
  Post,
  Put,
  UseGuards,
 Logger
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { UserEntity } from '@app/common'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
import { IRpcException } from '@app/common/filters/rpc.expection'

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,

  ) {}

  @Post('register')
  async registerNewUser (@Body() request: registerUserRequest): Promise<string> {
    this.logger.log('Registering a new user....')
    return await lastValueFrom(
      this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request }).pipe(
        catchError((error: IRpcException) => {
          this.logger.log('Failed to register user:', {message: error.message, status: error.status})
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('verify')
  async verifyUser (@Body() request: PhoneVerificationPayload): Promise<{status: number}> {
    this.logger.log('Verifying phone number...')
    return await lastValueFrom(
      this.notificationClient
        .send(QUEUE_MESSAGE.VERIFY_PHONE, {
          ...request
        })
        .pipe(
          catchError((error: IRpcException) => {
            this.logger.log('Failed to verify phone:', {message: error.message, status: error.status})
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile (@CurrentUser() user: UserEntity): Promise<UserEntity> {
    this.logger.log('getting new user')
    return user
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateUserProfile (
    @Body() data: Partial<UserEntity>,
      @CurrentUser() user: UserEntity
  ): Promise<UserEntity> {
    const payload: ServicePayload<Partial<UserEntity>> = {
      userId: user.id,
      data
    }
    this.logger.log('updating user profile...')
    return await lastValueFrom(
      this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_PROFILE, payload).pipe(
        catchError((error: { status: number, message: string }) => {
          this.logger.error('Failed to update user profile: ', {message: error.message, status: error.status})
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }


  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile')
  async deleteUser (
    @CurrentUser() user: UserEntity,
  ): Promise<{status: number}> {
    this.logger.log('deleting user profile....')

    const payload: ServicePayload<null> = {
      userId: user.id,
      data: null
    }

    return await lastValueFrom<{status: number}>(
      this.usersClient.send(QUEUE_MESSAGE.DELETE_USER_PROFILE, payload).pipe(
        catchError((error: IRpcException) => {
          this.logger.error('Failed to delete user profile', {status: error.status, message: error.message})
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
