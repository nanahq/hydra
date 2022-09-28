import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { TwilioService } from 'nestjs-twilio'
import { lastValueFrom } from 'rxjs'
import { FitRpcException } from '@app/common/filters/rpc.expection'

@Injectable()
export class NotificationServiceService {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
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
      throw new FitRpcException(
        'Provided code is not valid',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
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
      throw new FitRpcException(
        'Failed to send verification code',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
  }
}
