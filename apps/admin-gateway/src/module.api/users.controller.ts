import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  Admin,
  AdminLevel,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  User,
  UserI,
  TokenPayload
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy
  ) {}

  @Get('list')
  async getAllUsers (): Promise<UserI[]> {
    return await lastValueFrom<UserI[]>(
      this.usersClient.send(QUEUE_MESSAGE.GET_ALL_USERS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Delete('/:id/delete')
  async deleteUserProfile (
    @AdminClearance([AdminLevel.CUSTOMER_SERVICE, AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') userId: string): Promise<ResponseWithStatus> {
    const payload: ServicePayload<string | undefined> = {
      userId,
      data: ''
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.usersClient.send(QUEUE_MESSAGE.DELETE_USER_PROFILE, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('get-user')
  async getUser (
    @Body() userId: string
  ): Promise<User> {
    const payload: TokenPayload = {
      userId
    }
    return await lastValueFrom<User>(
      this.usersClient.send(QUEUE_MESSAGE.GET_USER, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
