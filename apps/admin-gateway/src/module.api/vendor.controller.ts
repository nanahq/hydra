import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  Patch,
  Put,
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
  UpdateVendorStatus,
  Vendor,
  VendorI
} from '@app/common'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ReasonDto } from '@app/common/database/dto/reason.dto'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('vendor')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @Get('vendors')
  async getAllVendors (): Promise<VendorI[]> {
    return await lastValueFrom<VendorI[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('metrics')
  async getMetrics (): Promise<any> {
    return await lastValueFrom<any>(
      this.vendorsClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_VENDOR_METRICS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

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

  @Put('status')
  async updateVendorStatus (
    @Body() data: UpdateVendorStatus
  ): Promise<{ status: number }> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_STATUS, data).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Delete('/:id')
  async deleteVendorProfile (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
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

  @Patch('/:id/approve')
  async approve (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') userId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient.send(QUEUE_MESSAGE.VENDOR_APPROVE, { userId }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Patch('/:id/disapprove')
  async disapprove (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Param('id') userId: string,
      @Body() req: ReasonDto
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorsClient
        .send(QUEUE_MESSAGE.VENDOR_DISAPPROVE, {
          userId,
          data: req
        })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
