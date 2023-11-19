import {
  Body,
  Controller, Get,
  HttpException,
  HttpStatus,
  Inject, Ip, Param,
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
  ChargeWithBankTransferDto,
  Payment,
  InitiateChargeDto,
  PaystackChargeResponseData,
  ChargeSuccessEvent,
  PaystackEvents
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

  @Post('charge/initiate')
  async initiateCharge (
    @Body() data: InitiateChargeDto
  ): Promise<PaystackChargeResponseData> {
    return await lastValueFrom<PaystackChargeResponseData>(
      this.paymentClient
        .send(QUEUE_MESSAGE.INITIATE_CHARGE_PAYSTACK, data)
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

  @Get('payment/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentInfo (
    @Param('id') orderId: string,
      @CurrentUser() user: User
  ): Promise<Payment> {
    return await lastValueFrom<Payment>(
      this.paymentClient
        .send(QUEUE_MESSAGE.GET_SINGLE_PAYMENT_USER, {
          orderId,
          userId: user._id
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('payments')
  @UseGuards(JwtAuthGuard)
  async getAllPaymentInfo (
    @CurrentUser() user: User
  ): Promise<Payment[]> {
    return await lastValueFrom<Payment[]>(
      this.paymentClient
        .send(QUEUE_MESSAGE.GET_ALL_PAYMENT_USER, {
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
  async flutterwavePaymentWebhook (@Body() body: any, @Res() res: Response): Promise<any> {
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

  @Post('paystack-webhook')
  async paystackPaymentWebhook (@Body() body: ChargeSuccessEvent, @Res() res: Response, @Ip() ip: string): Promise<any> {
    //     @Todo(siradji) improve ip whitelisting for paystack
    // if (!PaystackWebhookIps.includes(ip)) {
    //   return res.status(HttpStatus.UNAUTHORIZED).end()
    // }
    switch (body.event) {
      case PaystackEvents.PAYMENT_SUCCESS:
        await lastValueFrom(
          this.paymentClient.emit(QUEUE_MESSAGE.VERIFY_PAYMENT_PAYSTACK, { reference: body.data.reference })
        )
    }
    return res.status(HttpStatus.OK).end()
  }
}
