import { Controller } from '@nestjs/common'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'

import {
  RmqService,
  PhoneVerificationPayload,
  verifyPhoneRequest,
  QUEUE_MESSAGE,
  SendPayoutEmail,
  OrderStatusUpdateDto
} from '@app/common'
import { NotificationServiceService } from './notification-service.service'
import { TransactionEmails } from './email/transactional.service'

@Controller()
export class NotificationServiceController {
  constructor (
    private readonly notificationServiceService: NotificationServiceService,
    private readonly transctionalEmail: TransactionEmails,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.VERIFY_PHONE)
  async verify (
    @Payload() data: PhoneVerificationPayload,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.notificationServiceService.verifyPhone(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION)
  async sendVerification (
    @Payload() data: verifyPhoneRequest,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.notificationServiceService.sendVerification(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.ORDER_STATUS_UPDATE)
  async sendOrderStatus (
    @Payload() data: OrderStatusUpdateDto,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.notificationServiceService.sendOrderStatusUpdate(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.PROCESS_PAID_ORDER)
  async processPaidOrder (
    @Payload() data: OrderStatusUpdateDto,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.notificationServiceService.processPaidOrder(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.VENDOR_ACCEPT_ORDER)
  async vendorAcceptOrder (
    @Payload() { phone }: { phone: string },
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.notificationServiceService.vendorAcceptOrder(phone)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.SEND_PAYOUT_EMAILS)
  async sendPayoutEmails (
    @Payload() data: SendPayoutEmail[],
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      await this.transctionalEmail.sendVendorPayoutEmail(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
