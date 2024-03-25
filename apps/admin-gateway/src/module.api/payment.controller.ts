import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Patch,
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
  VendorPayout,
  Payment
} from '@app/common'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @Get('vendors-payout')
  async getAllPayout (
    @AdminClearance([AdminLevel.FINANCE, AdminLevel.CUSTOMER_SERVICE]) admin: Admin
  ): Promise<VendorPayout[]> {
    return await lastValueFrom<VendorPayout[]>(
      this.paymentClient.send(QUEUE_MESSAGE.WALLET_GET_PAYOUT_ALL, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Patch('vendors-payout/:id')
  async updatePayoutStatus (
    @AdminClearance([AdminLevel.FINANCE]) admin: Admin,
      @Param('id') _id: number):
      Promise<{ status: number }> {
    return await lastValueFrom<ResponseWithStatus>(
      this.paymentClient.send(QUEUE_MESSAGE.WALLET_UPDATE_PAYOUT, { _id }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('users')
  async getAllUserPayments (): Promise<Payment[]> {
    return await lastValueFrom<Payment[]>(
      this.paymentClient.send(QUEUE_MESSAGE.GET_ALL_USERS_PAYMENTS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
