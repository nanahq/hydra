import { MockModel } from '@app/common/database/test/support/mock.model'
import { VendorPayout } from '@app/common'
import { PayoutStub } from '../stub/payout.stub'

export class PayoutModel extends MockModel<VendorPayout> {
  protected entityStub = PayoutStub()
}
