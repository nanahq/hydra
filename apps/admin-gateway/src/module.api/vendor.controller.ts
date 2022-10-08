import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Put,
  UseGuards
} from '@nestjs/common'
import { QUEUE_MESSAGE, QUEUE_SERVICE, ResponseWithStatus } from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { catchError, lastValueFrom } from 'rxjs'
import { IRpcException } from '@app/common/filters/rpc.expection'
import { updateVendorStatus } from '@app/common/dto/UpdateVendorStatus.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('vendors')
export class VendorController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async getAllVendors (): Promise<VendorEntity[]> {
    return await lastValueFrom<VendorEntity[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-one/:id')
  async getVendor (@Param('id') vendorId: string): Promise<VendorEntity> {
    return await lastValueFrom(
      this.vendorsClient.send<VendorEntity>(QUEUE_MESSAGE.GET_VENDOR, { vendorId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-status')
  async updateVendorStatus (
    @Body() data: updateVendorStatus
  ): Promise<{ status: number }> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient.send<ResponseWithStatus>(QUEUE_MESSAGE.UPDATE_VENDOR_STATUS, data).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile/:id')
  async deleteVendorProfile (
    @Param('id') userId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient
        .send(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE, { userId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
