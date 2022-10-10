import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  UseGuards,
  Put,
  Delete
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  UpdateAdminLevelRequestDto,
  AdminEntity,
  ServicePayload,
  AdminLevel,
  IRpcException,
  ResponseWithStatus,
  RegisterAdminDTO
} from '@app/common'

@Controller('admin')
export class AdminController {
  constructor (
    @Inject(QUEUE_SERVICE.ADMIN_SERVICE)
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
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateAdminProfile (
    @Body() { level }: { level: string },
      @CurrentUser() admin: AdminEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateAdminLevelRequestDto> = {
      userId: admin.id,
      data: {
        id: admin.id,
        level: AdminLevel[level]
      }
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.UPDATE_ADMIN_STATUS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile')
  async deleteAdminProfile (
    @CurrentUser() admin: AdminEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: admin.id,
      data: null
    }

    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.DELETE_ADMIN, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile (
    @CurrentUser() admin: AdminEntity
  ): Promise<AdminEntity> {
    return admin
  }
}
