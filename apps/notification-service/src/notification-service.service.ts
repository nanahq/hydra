import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { TwilioService } from 'nestjs-twilio'
import { lastValueFrom } from 'rxjs'

import {
  OrderStatus,
  PhoneVerificationPayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  verifyPhoneRequest,
  OrderStatusUpdateDto,
  VendorSoldOutPush,
  ExportPushNotificationClient,
  PushMessage,
  ListingApprovePush,
  ListingRejectPush,
  VendorApprovedPush
} from '@app/common'

import { OrderStatusMessage } from './templates/OrderStatusMessage'
import { IncomingWebhook } from '@slack/webhook'

@Injectable()
export class NotificationServiceService {
  private readonly fromPhone: string
  private readonly logger = new Logger(NotificationServiceService.name)
  private readonly slackWebhook: IncomingWebhook
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly pushClient: ExportPushNotificationClient
  ) {
    this.fromPhone = 'Nana'
    const slackWebHookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL') as string
    this.slackWebhook = new IncomingWebhook(slackWebHookUrl)
  }

  async verifyPhone ({ code, phone }: PhoneVerificationPayload): Promise<any> {
    try {
      const res = await this.twilioService.client.verify.v2
        .services(
          this.configService.get<string>('TWILIO_SERVICE_NAME') as string
        )
        .verificationChecks.create({ to: phone, code })

      if (res.status === 'approved') {
        return await lastValueFrom(
          this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
            phone
          })
        )
      }
      return null
    } catch (error) {
      throw new RpcException(error)
    }
  }

  async sendVerification ({ phone }: verifyPhoneRequest): Promise<any> {
    try {
      return await this.twilioService.client.verify.v2
        .services(
          this.configService.get<string>('TWILIO_SERVICE_NAME') as string
        )
        .verifications.create({ to: phone, channel: 'sms' })
    } catch (error) {
      console.log(JSON.stringify(error))
      throw new RpcException(error)
    }
  }

  public async processPaidOrder ({
    phoneNumber,
    status
  }: OrderStatusUpdateDto): Promise<void> {
    const message = OrderStatusMessage[status]()
    this.logger.log(`Sending paid order status update for ${phoneNumber}`)
    this.twilioService.client.messages
      .create({
        from: this.fromPhone,
        body: message,
        to: phoneNumber
      })
      .then((msg) => {
        this.logger.log(`Sent paid order status update for ${phoneNumber}`)
        return msg
      })
      .catch((error) => {
        this.logger.error({
          error,
          message: 'failed to send paid order status sms'
        })
        throw new RpcException(error)
      })
  }

  async sendOrderStatusUpdate ({
    phoneNumber,
    status
  }: OrderStatusUpdateDto): Promise<void> {
    let message: string
    switch (status) {
      case OrderStatus.PROCESSED:
        message = OrderStatusMessage[status]()
        break
      case OrderStatus.COLLECTED:
        message = OrderStatusMessage[status]()
        break
      case OrderStatus.FULFILLED:
        message = OrderStatusMessage[status]()
        break
      case OrderStatus.IN_ROUTE:
        message = OrderStatusMessage[status]('50:30 pm')
        break
      default:
        message = 'not found'
    }

    this.twilioService.client.messages
      .create({
        from: this.fromPhone,
        body: message,
        to: phoneNumber
      })
      .then((msg) => msg)
      .catch((error) => {
        throw new RpcException(error)
      })
  }

  public async vendorAcceptOrder (phone: string): Promise<void> {
    const message = OrderStatusMessage[OrderStatus.ACCEPTED]()
    this.twilioService.client.messages
      .create({
        from: this.fromPhone,
        body: message,
        to: phone
      })
      .then((msg) => msg)
      .catch((error) => {
        throw new RpcException(error)
      })
  }

  public async sendSoldOutMessage (data: VendorSoldOutPush): Promise<void> {
    try {
      const message: PushMessage = {
        priority: 'high',
        title: `${data.listingName} has sold out!!`,
        body: `${data.vendorName}, ${data.listingQuantity} of the available ${data.listingName} have been order!`
      }
      return await this.pushClient.sendSingleNotification(data.token, message)
    } catch (error) {}
  }

  public async sendListingApprovedPush (
    data: ListingApprovePush
  ): Promise<void> {
    try {
      const message: PushMessage = {
        priority: 'high',
        title: `${data.listingName} has been approved!`,
        body: 'Your listing is now visible on Nana '
      }
      return await this.pushClient.sendSingleNotification(data.token, message)
    } catch (error) {}
  }

  public async sendListingRejectedPush (data: ListingRejectPush): Promise<void> {
    try {
      const message: PushMessage = {
        priority: 'high',
        title: `${data.listingName} has been rejected!`,
        body: 'Go to the listing and check the rejection reason'
      }
      return await this.pushClient.sendSingleNotification(data.token, message)
    } catch (error) {}
  }

  public async sendVendorApprovedPush (data: VendorApprovedPush): Promise<void> {
    try {
      const message: PushMessage = {
        priority: 'high',
        title: `${data.vendorName} Your account has been approved!!`,
        body: 'A warm welcome to Nana. Add listings to start selling'
      }
      return await this.pushClient.sendSingleNotification(data.token, message)
    } catch (error) {}
  }

  public async sendSlackMessage (message: string): Promise<any> {
    try {
      await this.slackWebhook.send({
        text: message
      })
    } catch (error) {}
  }
}
