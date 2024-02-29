import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  Res,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  CheckUserAccountI,
  CurrentUser,
  internationalisePhoneNumber,
  IRpcException,
  PhoneVerificationPayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  User
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AuthService } from './auth.service'
import { Response } from 'express'

@Controller('user')
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,

    private readonly authService: AuthService
  ) {}

  @Post('register')
  async registerNewUser (@Body() request: registerUserRequest): Promise<User> {
    return await lastValueFrom<User>(
      this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('verify')
  async verifyUser (
    @Body() request: PhoneVerificationPayload,
      @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    const user = await lastValueFrom<any>(
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
    if (user !== null) {
      return this.authService.login(user, response)
    }

    return { status: 0 }
  }

  @Get('validate/:phone')
  async validatePhoneNumber (
    @Param('phone') phone: string
  ): Promise<CheckUserAccountI> {
    return await lastValueFrom<CheckUserAccountI>(
      this.usersClient.send(QUEUE_MESSAGE.CHECK_PHONE_NUMBER, { phone }).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile (@CurrentUser() user: User): Promise<User> {
    return user
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateUserProfile (
    @Body() data: Partial<User>,
      @CurrentUser() user: User
  ): Promise<User> {
    const payload: ServicePayload<Partial<User>> = {
      userId: user._id as any,
      data
    }
    return await lastValueFrom<User>(
      this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_PROFILE, payload).pipe(
        catchError((error: { status: number, message: string }) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteUser (@CurrentUser() user: User): Promise<{ status: number }> {
    const payload: ServicePayload<null> = {
      userId: user._id as any,
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

  @Get('resend-validation/:phone')
  async resendPhoneVerification (
    @Param('phone') phone: string
  ): Promise<{ status: number }> {
    return await lastValueFrom<ResponseWithStatus>(
      this.usersClient
        .send(QUEUE_MESSAGE.RESEND_PHONE_VERIFICATION, { phone })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('delete-request/:phone')
  async deleteAccountRequest (@Param('phone') phone: string): Promise<void> {
    const formattedPhone = internationalisePhoneNumber(phone)
    return await lastValueFrom<any>(
      this.usersClient.emit(QUEUE_MESSAGE.ACCOUNT_DELETE_REQUEST, {
        phone: formattedPhone
      })
    )
  }
}
