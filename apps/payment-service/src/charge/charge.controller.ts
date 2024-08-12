import {
  ExceptionFilterRpc,
  OrderInitiateCharge,
  PaystackChargeResponseData,
  QUEUE_MESSAGE,
  RmqService,
  Payment
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

  @MessagePattern(QUEUE_MESSAGE.INITIATE_CHARGE_PAYSTACK)
  async initiatePaystackCharge (
    @Payload() payload: OrderInitiateCharge,
      @Ctx() context: RmqContext
  ): Promise<PaystackChargeResponseData> {
    try {
      return await this.paymentService.initiateChargePaystack(payload)
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

  @EventPattern(QUEUE_MESSAGE.VERIFY_PAYMENT_PAYSTACK)
  async verifyPaymentPaystack (
    @Payload() { reference }: { reference: string },
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      await this.paymentService.verifyPaymentPaystack(reference)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_USERS_PAYMENTS)
  async getAllUsersPayments (@Ctx() context: RmqContext): Promise<Payment[] | null> {
    try {
      return this.paymentService.getAllUsersPayments()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
