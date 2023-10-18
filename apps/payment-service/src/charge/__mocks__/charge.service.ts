import { PaymentServiceI } from '@app/common'
import { BankTransferChargeStub } from '../../shared/stub/charge.stub'

const mockValue: PaymentServiceI = {
  chargeWithBankTransfer: jest.fn().mockResolvedValue(BankTransferChargeStub()),
  chargeWithUssd: jest.fn().mockResolvedValue(null),
  verifyPayment: jest.fn().mockResolvedValue(null)

}
export const PaymentService = jest.fn().mockReturnValue(mockValue)
