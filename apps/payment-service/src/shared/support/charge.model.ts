import { MockModel } from '@app/common/database/test/support/mock.model'
import { Payment } from '@app/common'
import { PaymentStub } from '../stub/charge.stub'

export class PaymentModel extends MockModel<Payment> {
  protected entityStub = PaymentStub()
}
