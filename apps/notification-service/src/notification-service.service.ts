import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { TwilioService } from 'nestjs-twilio'
import { lastValueFrom } from 'rxjs'

import {
  OrderStatus,
  PhoneVerificationPayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  verifyPhoneRequest
} from '@app/common'
import { OrderStatusUpdateDto } from '@app/common/dto/OrderStatusUpdate.dto'
import { OrderStatusMessage } from './templates/OrderStatusMessage'

@Injectable()
export class NotificationServiceService {
  private readonly fromPhone: string
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService
  ) {
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE') as string
  }

  async verifyPhone ({
    code,
    phone
  }: PhoneVerificationPayload): Promise<any> {
    try {
      const res = await this.twilioService.client.verify.v2
        .services(
          this.configService.get<string>('TWILIO_SERVICE_NAME') as string
        )
        .verificationChecks.create({ to: phone, code })

      if (res.status === 'approved') {
        await lastValueFrom(
          this.usersClient.emit(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
            phone
          })
        )
        return { status: 1 }
      }
      return { status: 0 }
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
      throw new RpcException(error)
    }
  }

  public async processPaidOrder ({
    phoneNumber,
    status
  }: OrderStatusUpdateDto): Promise<void> {
    const message = OrderStatusMessage[status]()
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
}
