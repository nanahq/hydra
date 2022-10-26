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
import { ListingEntity } from '@app/common/database/entities/Listing'

@Injectable()
export class NotificationServiceService {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService
  ) {}

  async verifyPhone ({
    code,
    phoneNumber
  }: PhoneVerificationPayload): Promise<any> {
    try {
      const res = await this.twilioService.client.verify.v2
        .services(
          this.configService.get<string>('TWILIO_SERVICE_NAME') as string
        )
        .verificationChecks.create({ to: phoneNumber, code })

      if (res.status === 'approved') {
        await lastValueFrom(
          this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
            phoneNumber
          })
        )
        return { status: 1 }
      }
      return { status: 0 }
    } catch (error) {
      throw new RpcException(error)
    }
  }

  async sendVerification ({ phoneNumber }: verifyPhoneRequest): Promise<any> {
    try {
      return await this.twilioService.client.verify.v2
        .services(
          this.configService.get<string>('TWILIO_SERVICE_NAME') as string
        )
        .verifications.create({ to: phoneNumber, channel: 'sms' })
    } catch (error) {
      throw new RpcException(error)
    }
  }

  async sendOrderStatusUpdate ({
    phoneNumber,
    status,
    listingId
  }: OrderStatusUpdateDto): Promise<void> {
    let message: string
    const fromPhone = this.configService.get<string>('TWILIO_PHONE') as string
    try {
      const listing = await lastValueFrom<ListingEntity>(
        this.listingsClient.send(QUEUE_MESSAGE.GET_LISTING_INFO, {
          userId: '',
          data: { listingId }
        })
      )

      switch (status) {
        case OrderStatus.PROCESSED:
          message = OrderStatusMessage[status](listing.listingName)
          break
        case OrderStatus.COLLECTED:
          message = OrderStatusMessage[status](listing.listingName)
          break
        case OrderStatus.FULFILLED:
          message = OrderStatusMessage[status](listing.listingName)
          break
        case OrderStatus.IN_ROUTE:
          message = OrderStatusMessage[status]('50:30 pm')
          break
        default:
          message = 'not found'
      }
    } catch (error) {
      throw new RpcException(error)
    }


      this.twilioService.client.messages.create({
          from: fromPhone,
          body: message,
          to: phoneNumber
      }).then(msg => msg)
          .catch(error => {throw new RpcException(error)})
  }
}
