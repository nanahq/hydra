import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  BankTransferAccountDetails,
  CurrentUser,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  User,
  ChargeWithUssdDto,
  ChargeWithBankTransferDto
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { catchError, lastValueFrom } from 'rxjs'
import { Response } from 'express'

@Controller('payment')
export class PaymentController {
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @Post('charge/bank-transfer')
  @UseGuards(JwtAuthGuard)
  async chargeWithBankTransfer (
    @Body() data: ChargeWithBankTransferDto,
      @CurrentUser() user: User
  ): Promise<BankTransferAccountDetails> {
    return await lastValueFrom<BankTransferAccountDetails>(
      this.paymentClient
        .send(QUEUE_MESSAGE.CHARGE_BANK_TRANSFER, {
          ...data,
          userId: user._id
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('charge/ussd')
  @UseGuards(JwtAuthGuard)
  async chargeWithUssd (
    @Body() data: ChargeWithUssdDto,
      @CurrentUser() user: User
  ): Promise<{ code: string }> {
    return await lastValueFrom<{ code: string }>(
      this.paymentClient
        .send(QUEUE_MESSAGE.CHARGE_USSD, {
          ...data,
          userId: user._id
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Post('flw-webhook')
  async paymentWebhook (@Body() body: any, @Res() res: Response): Promise<any> {
    if (body?.data?.status === 'successful') {
      await lastValueFrom<any>(
        this.paymentClient.emit(QUEUE_MESSAGE.VERIFY_PAYMENT, {
          txId: body?.data?.id,
          refId: body?.data?.tx_ref
        })
      )
    }
    return res.status(HttpStatus.OK).end()
  }
}
