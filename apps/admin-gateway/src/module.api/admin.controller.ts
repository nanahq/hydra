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
  UseGuards,
    Put,
    Delete
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { RegisterAdminDTO } from '@app/common/dto/registerAdminDTO.dto'
import { AdminEntity } from '@app/common/database/entities/Admin'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
import { IRpcException } from '@app/common/filters/rpc.expection'
import { UpdateAdminLevelRequestDto } from '@app/common/dto/updateAdminLevelRequest.dto'
import { AdminLevel } from '@app/common/typings/AdminLevel.enum'

@Controller('admin')
export class AdminController {
  constructor (
    @Inject(QUEUE_SERVICE.ADMIN_SERVICE)
    private readonly adminClient: ClientProxy
  ) {}

  @Post('register')
  async registerNewUser (@Body() request: RegisterAdminDTO): Promise<{status: number}> {
    const payload: ServicePayload<RegisterAdminDTO> = {
      userId: '',
      data: request
    }
    return await lastValueFrom(
      this.adminClient.send<{status: number}>(QUEUE_MESSAGE.CREATE_ADMIN, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateAdminProfile(
      @Body() {level}: {level: string},
      @CurrentUser() admin: AdminEntity
  ) : Promise<{status: number}> {

    const payload: ServicePayload<UpdateAdminLevelRequestDto> = {
      userId: admin.id,
      data: {
        id: admin.id,
        level: AdminLevel[level]
      }
    }

    return await lastValueFrom<{status: number}>(
        this.adminClient.send(QUEUE_MESSAGE.UPDATE_ADMIN_STATUS, payload)
            .pipe(
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
  ): Promise<{status: number}> {
    const payload: ServicePayload<null> = {
      userId: admin.id, data: null
    }
    return await lastValueFrom<{status: number}>(
        this.adminClient.send(QUEUE_MESSAGE.DELETE_ADMIN, payload)
            .pipe(
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
