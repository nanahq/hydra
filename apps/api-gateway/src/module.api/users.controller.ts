import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { registerUserRequest } from '@app/common/dto/registerUser.dto'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { UserEntity } from '@app/common'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
import { string } from 'joi'

@Controller('users')
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  @Post('register')
  async registerNewUser (@Body() request: registerUserRequest): Promise<any> {
    return await lastValueFrom(
      this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request }).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('verify')
  async verifyUser (@Body() request: PhoneVerificationPayload): Promise<any> {
    return await lastValueFrom(
      this.notificationClient
        .send(QUEUE_MESSAGE.VERIFY_PHONE, {
          ...request
        })
        .pipe(
          catchError((error) => {
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
    return await lastValueFrom(
      this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_PROFILE, payload).pipe(
        catchError((error: { status: number, message: string }) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Delete('users/:id')
  async deleteUser (@Body() data: string) {
    const payload = { data }
    return await lastValueFrom(
      this.usersClient.send(QUEUE_MESSAGE.DELETE_USER, payload).pipe(
        catchError((error: { status: number, message: string }) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
