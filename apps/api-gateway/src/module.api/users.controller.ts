import { Body, Controller, Delete, Get, HttpException, Inject, Post, Put, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  IRpcException,
  PhoneVerificationPayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  UserEntity
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'

@Controller('users')
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  @Post('register')
  async registerNewUser (
    @Body() request: registerUserRequest
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('verify')
  async verifyUser (
    @Body() request: PhoneVerificationPayload
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.notificationClient
        .send(QUEUE_MESSAGE.VERIFY_PHONE, {
          ...request
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile (@CurrentUser() user: UserEntity): Promise<UserEntity> {
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
    return await lastValueFrom<UserEntity>(
      this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_PROFILE, payload).pipe(
        catchError((error: { status: number, message: string }) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile')
  async deleteUser (
    @CurrentUser() user: UserEntity
  ): Promise<{ status: number }> {
    const payload: ServicePayload<null> = {
      userId: user.id,
      data: null
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.usersClient.send(QUEUE_MESSAGE.DELETE_USER_PROFILE, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
