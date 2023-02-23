import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';

import {
  RmqService,
  PhoneVerificationPayload,
  verifyPhoneRequest,
  QUEUE_MESSAGE,
} from '@app/common';
import { NotificationServiceService } from './notification-service.service';
import { OrderStatusUpdateDto } from '@app/common/dto/OrderStatusUpdate.dto';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern(QUEUE_MESSAGE.VERIFY_PHONE)
  async verify(
    @Payload() data: PhoneVerificationPayload,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    try {
      this.rmqService.ack(context);
      return await this.notificationServiceService.verifyPhone(data);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @EventPattern(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION)
  async sendVerification(
    @Payload() data: verifyPhoneRequest,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    try {
      this.rmqService.ack(context);
      return await this.notificationServiceService.sendVerification(data);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @EventPattern(QUEUE_MESSAGE.ORDER_STATUS_UPDATE)
  async sendOrderStatus(
    @Payload() data: OrderStatusUpdateDto,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    try {
      return await this.notificationServiceService.sendOrderStatusUpdate(data);
    } catch (error) {
      throw new RpcException(error);
    } finally {
      this.rmqService.ack(context);
    }
  }
}
