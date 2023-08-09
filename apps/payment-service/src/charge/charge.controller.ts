import {
  BankTransferAccountDetails,
  BankTransferRequest,
  CreditChargeRequest,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  RmqService,
} from '@app/common'
import { Controller } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { PaymentService } from './charge.service'

@Controller('charge')
export class PaymentController {
  constructor (
    private readonly paymentService: PaymentService,
    private readonly rmqService: RmqService

  ) {}

  @MessagePattern(QUEUE_MESSAGE.CHARGE_CREDIT_CARD)
  async chargeWithCreditCard (
    @Payload() payload: CreditChargeRequest,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.paymentService.chargeWithCreditCard(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CHARGE_BANK_TRANSFER)
  async chargeWithBankTransfer (
      @Payload() payload: BankTransferRequest,
      @Ctx() context: RmqContext
  ): Promise<BankTransferAccountDetails> {
    try {
      return await this.paymentService.chargeWithBankTransfer(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
