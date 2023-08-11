import {
  BankTransferRequest,
  ExceptionFilterRpc,
  QUEUE_MESSAGE,
  RmqService, UssdRequest,
} from '@app/common'
import { Controller, UseFilters } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { PaymentService } from './charge.service'

@UseFilters(new ExceptionFilterRpc())
@Controller('charge')
export class PaymentController {
  constructor (
    private readonly paymentService: PaymentService,
    private readonly rmqService: RmqService

  ) {}

  @MessagePattern(QUEUE_MESSAGE.CHARGE_BANK_TRANSFER)
  async chargeWithBankTransfer (
      @Payload() payload: BankTransferRequest,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.paymentService.chargeWithBankTransfer(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.CHARGE_USSD)
  async chargeWithUssd (
      @Payload() payload: UssdRequest,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.paymentService.chargeWithUssd(payload)
    } catch(error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
