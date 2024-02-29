import { Body, Controller, HttpException, Inject, Post } from '@nestjs/common'
import {
  Admin,
  AdminLevel,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { CreditWallet, UpdateTransaction } from '@app/common/dto/General.dto'
import { DriverWalletTransaction } from '@app/common/database/schemas/driver-wallet-transactions.schema'
import { FilterQuery } from 'mongoose'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('payment/driver')
export class DriverTransactionController {
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @Post('transactions')
  public async getTransactions (
    @AdminClearance([AdminLevel.FINANCE]) admin: Admin,
      @Body() filter: FilterQuery<DriverWalletTransaction>
  ): Promise<DriverWalletTransaction[]> {
    return await lastValueFrom<DriverWalletTransaction[]>(
      this.paymentClient
        .send(QUEUE_MESSAGE.DRIVER_WALLET_FETCH_TRANSACTIONS, filter)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('credit-driver')
  public async creditDriver (
    @AdminClearance([AdminLevel.FINANCE]) admin: Admin,
      @Body() data: CreditWallet
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.paymentClient
        .send(QUEUE_MESSAGE.DRIVER_WALLET_ADD_BALANCE, data)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('process-withdrawal')
  public async processWithdrawal (
    @AdminClearance([AdminLevel.FINANCE]) admin: Admin,
      @Body() data: UpdateTransaction
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.paymentClient
        .send(QUEUE_MESSAGE.DRIVER_WALLET_UPDATE_TRANSACTION, data)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
