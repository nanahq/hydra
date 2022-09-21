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
  Post,
  UnprocessableEntityException,
  UseFilters,
  UseGuards
} from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { User } from 'apps/users-service/src/schema'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'

@Controller('/users')
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  @Post('/register')
  async registerNewUser (@Body() request: registerUserRequest): Promise<any> {
      const newUser = await lastValueFrom(
        this.usersClient.send(QUEUE_MESSAGE.CREATE_USER, { ...request })
        .pipe(
          catchError((error) => {
                throw new HttpException(error.message, error.status)
          })
        )
      )
      return newUser
  }

  @Post('/verify')
  async verifyUser (@Body() request: PhoneVerificationPayload): Promise<any> {
      return await lastValueFrom(
        this.notificationClient.send(QUEUE_MESSAGE.VERIFY_PHONE, {
          ...request
        }).pipe(
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
}
