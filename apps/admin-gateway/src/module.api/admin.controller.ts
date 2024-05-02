import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './decorators/current-user.decorator'

import {
  Admin,
  AdminLevel,
  IRpcException,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RegisterAdminDTO,
  ResponseWithStatus,
  ServicePayload,
  UpdateAdminLevelRequestDto
} from '@app/common'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(Admin.name)

  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy
  ) {}

  @Get('list')
  async getAll (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin
  ): Promise<ResponseWithStatus> {
    const payload: {} = {}
    this.logger.debug('Getting all admin')
    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send<any>(QUEUE_MESSAGE.GET_ALL_ADMIN, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('register')
  async registerNewUser (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
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

  @Put('')
  async updateAdminProfile (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
    @Body() { level, adminId }: { level: string, adminId: string }
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateAdminLevelRequestDto> = {
      userId: adminId as any,
      data: {
        id: adminId as any,
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

  @Delete('/:id')
  async deleteAdminProfile (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
      @Param('id') id: string
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: id as any,
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

  @Get('admin')
  async getUserProfile (@CurrentUser() admin: Admin): Promise<Admin> {
    return admin
  }

  @Put('password-reset')
  async resetAdminPassword (
    @CurrentUser() admin: Admin,
      @Body() { password }: { password: string }
  ): Promise<ResponseWithStatus> {
    const payload: MultiPurposeServicePayload<string> = {
      id: admin._id.toString(),
      data: password
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.adminClient.send(QUEUE_MESSAGE.RESET_ADMIN_PASSWORD, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
