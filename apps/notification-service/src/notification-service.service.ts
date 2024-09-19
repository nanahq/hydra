import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { TwilioService } from 'nestjs-twilio'
import { firstValueFrom, lastValueFrom } from 'rxjs'

import {
  ExportPushNotificationClient,
  FitRpcException,
  internationalisePhoneNumber,
  ListingApprovePush,
  ListingRejectPush,
  OrderStatus,
  OrderStatusUpdateDto,
  PushMessage,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  VendorApprovedPush,
  VendorSoldOutPush,
  verifyPhoneRequest
} from '@app/common'

import { OrderStatusMessage } from './templates/OrderStatusMessage'
import { HttpService } from '@nestjs/axios'
import { TermiiService } from '@app/common/termii/termii'
import { TermiiPayload, TermiiResponse } from '@app/common/typings/Termii'
import { verifyTermiiToken } from '@app/common/dto/verifyTermiiToken.dto'

@Injectable()
export class NotificationServiceService {
  private readonly fromPhone: string
  private readonly logger = new Logger(NotificationServiceService.name)
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly pushClient: ExportPushNotificationClient,

    private readonly httpService: HttpService,
    private readonly termiiService: TermiiService
  ) {
    this.fromPhone = 'Nana'
  }

  // async verifyPhone ({ code, phone }: PhoneVerificationPayload): Promise<any> {
  //   try {
  //     const res = await this.twilioService.client.verify.v2
  //       .services(
  //         this.configService.get<string>('TWILIO_SERVICE_NAME') as string
  //       )
  //       .verificationChecks.create({ to: phone, code })

  //     if (res.status === 'approved') {
  //       return await lastValueFrom(
  //         this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
  //           phone
  //         })
  //       )
  //     }
  //     return null
  //   } catch (error) {
  //     throw new RpcException(error)
  //   }
  // }

  async verifyPhoneTermii ({ pinId, pin }: verifyTermiiToken): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('TERMII_API_KEY') as string

      const res = await this.termiiService.verifySMSToken({
        api_key: apiKey,
        pin_id: pinId,
        pin
      })

      if (res.verified === true) {
        return await lastValueFrom(
          this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
            phone: internationalisePhoneNumber(res.msisdn)
          })
        )
      } else if (res.verified === false) {
        throw new FitRpcException('Wrong OPT. Please recheck the sms sent to you', HttpStatus.BAD_REQUEST)
      } else if (typeof res.verified === 'string' && res.verified.toLowerCase().includes('expired')) {
        throw new FitRpcException('Code has expired. Please request a new code', HttpStatus.BAD_REQUEST)
      }
      return null
    } catch (error) {
      throw new RpcException(error)
    }
  }

  async sendVerificationTermii ({ phone }: verifyPhoneRequest): Promise<TermiiResponse> {
    try {
      this.logger.log(
        `[PIM] - Initiating SMS token for ${phone}`
      )

      const payload: TermiiPayload = {
        api_key: this.configService.get<string>('TERMII_API_KEY', ''),
        message_type: 'NUMERIC',
        to: internationalisePhoneNumber(phone),
        from: this.configService.get<string>('TERMII_SERVICE_NAME', ''),
        channel: 'dnd',
        pin_attempts: 2,
        pin_time_to_live: 1,
        pin_length: 6,
        pin_type: 'NUMERIC',
        pin_placeholder: '< 1234 >',
        message_text: 'Your nana verification code is < 1234 >'
      }

      return await this.termiiService.sendSMSToken(payload)
    } catch (error) {
      console.log(JSON.stringify(error))
      throw new RpcException(error)
    }
  }

  // async sendVerification ({ phone }: verifyPhoneRequest): Promise<any> {
  //   try {
  //     return await this.twilioService.client.verify.v2
  //       .services(
  //         this.configService.get<string>('TWILIO_SERVICE_NAME') as string
  //       )
  //       .verifications.create({ to: phone, channel: 'sms' })
  //   } catch (error) {
  //     console.log(JSON.stringify(error))
  //     throw new RpcException(error)
  //   }
  // }

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

  public async sendSlackMessage (message: string): Promise<void> {
    try {
      const url = this.configService.get<string>('SLACK_WEBHOOK_URL') as string
      await firstValueFrom(this.httpService.post(url, {
        text: message
      }))
    } catch (error) {}
  }

  async ping (): Promise<string> {
    return 'PONG'
  }
}
