import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Body,
  Controller, Delete,
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
import { VendorDto } from '@app/common/database/dto/vendor.dto'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { ServicePayload } from '@app/common/typings/ServicePayload.interface'
import { IRpcException } from '@app/common/filters/rpc.expection'

@Controller('/vendor')
export class VendorController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy
  ) {}

  @Post('/register')
  async registerNewUser (@Body() request: VendorDto): Promise<any> {
    return await lastValueFrom(
      this.vendorClient.send(QUEUE_MESSAGE.CREATE_VENDOR, { ...request }).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getVendorProfile (
    @CurrentUser() vendor: VendorEntity
  ): Promise<VendorEntity> {
    return vendor
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateVendorProfile (
    @Body() data: Partial<VendorEntity>,
      @CurrentUser() vendor: VendorEntity
  ): Promise<string> {
    const payload: ServicePayload<Partial<VendorEntity>> = {
      userId: vendor.id,
      data
    }
    return await lastValueFrom(
      this.vendorClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile')
  async deleteVendorProfile(
      @CurrentUser() vendor: VendorEntity
  ): Promise<{status: number}> {

    const payload: ServicePayload<null> = {
      userId: vendor.id,
      data: null
    }

    return await lastValueFrom<{status: number}>(
        this.vendorClient.send(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE, payload)
            .pipe(
                catchError((error: IRpcException) => {
                  throw new HttpException(error.message, error.status)
    })
            )
    )
  }
}
