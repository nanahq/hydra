import { BrevoClient, FitRpcException, SendPayoutEmail } from '@app/common'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { vendorpayoutTemplate } from '../templates/vendorpayout.template'

@Injectable()
export class TransactionEmails {
  private readonly logger = new Logger(TransactionEmails.name)
  constructor (
    private readonly brevoClient: BrevoClient
  ) {}

  async sendSinglePayoutEmail (data: SendPayoutEmail): Promise<void> {
    try {
      await this.brevoClient.sendVendorPayoutEmail({
        to: [{
          name: data.vendorName,
          email: data.vendorEmail
        }],
        htmlContent: vendorpayoutTemplate({
          bankName: data.vendorBankDetails,
          amount: data.payoutAmount,
          date: data.payoutDate
        }),
        subject: 'Nana Payout',
        sender: { email: 'payouts@trynanaapp.com', name: 'Nana Payouts' },
        replyTo: { email: 'payouts@trynanaapp.com', name: 'Nana Payouts' }
      })
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error('[PIM] -> Something went wrong sending vendor payout emails ')
      throw new FitRpcException('Something went wrong sending mails', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendVendorSignupMail (): Promise<void> {}
}
