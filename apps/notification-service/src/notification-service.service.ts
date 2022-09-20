import { PhoneVerificationPayload } from '@app/common/dto/phoneVerificationPayload.dto'
import { verifyPhoneRequest } from '@app/common/dto/verifyPhoneRequest.dto'
import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientProxy } from '@nestjs/microservices'
import { TwilioService } from 'nestjs-twilio'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class NotificationServiceService {
  constructor (
    @Inject(QUEUE_SERVICE.USERS_SERVICE) private readonly usersClient: ClientProxy,
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService
  ) {}

  async verifyPhone ({ code, phoneNumber }: PhoneVerificationPayload): Promise<any> {
    try {
      const res = await this.twilioService.client.verify.v2
        .services(this.configService.get<string>('TWILIO_SERVICE_NAME') as string)
        .verificationChecks.create({ to: phoneNumber, code })

      if (res.status === 'approved') {
        await lastValueFrom(
          this.usersClient.send(QUEUE_MESSAGE.UPDATE_USER_STATUS, {
            phoneNumber
          })
        )
        return { status: 1 }
      }
      throw new UnprocessableEntityException('Provided code is not valid')
    } catch (error) {
      throw new UnprocessableEntityException(error)
    }
  }

  async sendVerification ({ phoneNumber }: verifyPhoneRequest): Promise<any> {
    try {
      return await this.twilioService.client.verify.v2
        .services(this.configService.get<string>('TWILIO_SERVICE_NAME') as string)
        .verifications.create({ to: phoneNumber, channel: 'sms' })
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
