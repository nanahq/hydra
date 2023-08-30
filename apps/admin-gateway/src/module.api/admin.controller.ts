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

import {
  Admin,
  AdminLevel,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RegisterAdminDTO,
  ResponseWithStatus,
  ServicePayload,
  UpdateAdminLevelRequestDto
} from '@app/common'

@Controller('admin')
export class AdminController {
  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy
  ) {}

  @Post('register')
  async registerNewUser (
    @Body() request: RegisterAdminDTO
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<RegisterAdminDTO> = {
      userId: '',
      data: request
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.CREATE_ADMIN, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('')
  async updateAdminProfile (
    @Body() { level }: { level: string },
      @CurrentUser() admin: Admin
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateAdminLevelRequestDto> = {
      userId: admin._id as any,
      data: {
        id: admin._id as any,
        level: AdminLevel[level]
      }
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.UPDATE_ADMIN_STATUS, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  async deleteAdminProfile (
    @CurrentUser() admin: Admin
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: admin._id as any,
      data: null
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.DELETE_ADMIN, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getUserProfile (@CurrentUser() admin: Admin): Promise<Admin> {
    return admin
  }
}
