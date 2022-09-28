import { RmqService } from '@app/common'
import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto'
import { QUEUE_MESSAGE } from '@app/common/typings/QUEUE_MESSAGE'
import { Controller } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import { NotificationServiceService } from './notification-service.service'

@Controller()
export class NotificationServiceController {
  constructor (
    private readonly notificationServiceService: NotificationServiceService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.VERIFY_PHONE)
  async verify (
    @Payload() data: PhoneVerificationPayload,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      this.rmqService.ack(context)
      return await this.notificationServiceService.verifyPhone(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION)
  async sendVerification (
    @Payload() data: verifyPhoneRequest,
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      this.rmqService.ack(context)
      return await this.notificationServiceService.sendVerification(data)
    } catch (error) {
      throw new RpcException(error)
    }
  }
}
