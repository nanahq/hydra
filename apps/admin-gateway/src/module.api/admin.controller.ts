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
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { RegisterAdminDTODto } from '@app/common/dto/registerAdminDTO.dto'
import { AdminEntity } from '@app/common/database/entities/Admin'

@Controller('/admin')
export class AdminController {
  constructor (
    @Inject(QUEUE_SERVICE.ADMIN_SERVICE)
    private readonly adminClient: ClientProxy
  ) {}

  @Post('/register')
  async registerNewUser (@Body() request: RegisterAdminDTODto): Promise<any> {
    return await lastValueFrom(
      this.adminClient.send(QUEUE_MESSAGE.CREATE_ADMIN, { ...request }).pipe(
        catchError((error) => {
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
