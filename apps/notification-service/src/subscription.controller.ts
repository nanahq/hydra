import { Controller, UseFilters } from '@nestjs/common'
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
  QUEUE_MESSAGE,
  SubscribeDto,
  ExceptionFilterRpc,
  UpdateSubscriptionByVendorDto,
  ScheduledPushPayload,
  ServicePayload,
  ScheduledListingNotification,
  SendApprovalPushNotification
} from '@app/common'
import { SubscriptionService } from './subscription.service'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class SubscriptionController {
  constructor (
    private readonly subscriptionService: SubscriptionService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.GET_USER_SUBSCRIPTIONS)
  async getUserSubscriptions (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ScheduledListingNotification[]> {
    try {
      return await this.subscriptionService.getUserSubscriptions(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_SUBSCRIPTION)
  async getVendorSubscription (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<ScheduledListingNotification> {
    try {
      return await this.subscriptionService.getVendorSubscription(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.CREATE_VENDOR_NOTIFICATION)
  async createVendorNotificationSub (
    @Payload() payload: SendApprovalPushNotification,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.subscriptionService.createSubscriptionInstance(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.USER_SUBSCRIBE_TO_VENDOR)
  async userSubscribeUnsubscribe (
    @Payload() payload: SubscribeDto,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.subscriptionService.subscribeUnsubscribeUser(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.VENDOR_UPDATE_NOTIFICATION_SETTINGS)
  async vendorUpdateSubscriptionSetting (
    @Payload() payload: UpdateSubscriptionByVendorDto,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.subscriptionService.updateSubscriptionSetting(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.SEND_PUSH_NOTIFICATION_LISTING)
  async sendPushNotificationForNewListing (
    @Payload() payload: ScheduledPushPayload,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.subscriptionService.sendPushMessageToSubscribers(
        payload
      )
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
