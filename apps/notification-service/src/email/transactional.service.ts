import { SendPayoutEmail } from '@app/common'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as SibApiV3Sdk from '@sendinblue/client'

@Injectable()
export class TransactionEmails {
  private readonly apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  private readonly logger = new Logger(TransactionEmails.name)
  constructor (private readonly configService: ConfigService) {
    this.apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('SEND_IN_BLUE_API') ?? ''
    )
  }

  async sendVendorPayoutEmail (payload: SendPayoutEmail[]): Promise<void> {
    this.logger.log(payload)
    for (const data of payload) {
      await this.apiInstance.sendTransacEmail({
        subject: 'EatLater Payout',
        sender: { email: 'notifications@eatlater.ng', name: 'EatLater' },
        replyTo: { email: 'notifications@eatlater.ng', name: 'EatLater' },
        to: [{ email: `${data.vendorEmail}` }],
        htmlContent:
          '<html><body><h1>This is a transactional email {{params.bodyMessage}}</h1></body></html>',
        params: { bodyMessage: 'Made just for you!' }
      })
    }
  }

  async sendVendorSignupMail (): Promise<void> {}
}
