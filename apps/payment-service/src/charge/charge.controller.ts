import {
  BankTransferAccountDetails,
  BankTransferRequest,
  ExceptionFilterRpc, PaystackCharge,
  QUEUE_MESSAGE,
  RmqService,
  UssdRequest
} from '@app/common'
import { Controller, UseFilters } from '@nestjs/common'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
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
  ): Promise<BankTransferAccountDetails> {
    try {
      return await this.paymentService.chargeWithBankTransfer(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.INITIATE_CHARGE_PAYSTACK)
  async intiatePaystackCharge (
    @Payload() payload: PaystackCharge,
      @Ctx() context: RmqContext
  ): Promise<BankTransferAccountDetails> {
    try {
      return await this.paymentService.initiateChargePaystack(payload)
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
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_SINGLE_PAYMENT_USER)
  async getPaymentInfo (
    @Payload() payload: { userId: string, orderId: string },
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.paymentService.getPaymentInfo(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_PAYMENT_USER)
  async getAllPaymentInfo (
    @Payload() payload: { userId: string },
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.paymentService.getAllPaymentInfo(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.VERIFY_PAYMENT)
  async verifyPayment (
    @Payload() { txId, refId }: { txId: string, refId: string },
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      await this.paymentService.verifyPayment(txId, refId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
