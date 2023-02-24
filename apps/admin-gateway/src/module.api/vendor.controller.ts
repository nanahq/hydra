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
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  UpdateVendorStatus,
  IRpcException,
  Vendor
} from '@app/common'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('vendor')
export class VendorController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('vendors')
  async getAllVendors (): Promise<Vendor[]> {
    return await lastValueFrom<Vendor[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getVendor (@Param('id') vendorId: string): Promise<Vendor> {
    const payload: ServicePayload<string> = {
      userId: '',
      data: vendorId
    }
    return await lastValueFrom<Vendor>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('tatus')
  async updateVendorStatus (
    @Body() data: UpdateVendorStatus
  ): Promise<{ status: number }> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_STATUS, data).pipe(
        catchError<any any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteVendorProfile (
    @Param('id') userId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient
        .send(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE, { userId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
