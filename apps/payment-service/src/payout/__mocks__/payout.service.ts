import { VendorPayoutServiceI } from '@app/common'
import { resStub } from '../../shared/stub/charge.stub'
import { PayoutOverviewStub, PayoutStub } from '../../shared/stub/payout.stub'

export const mockValue: VendorPayoutServiceI = {
  createPayout: jest.fn().mockResolvedValue(resStub()),
  updatePayoutStatus: jest.fn().mockResolvedValue(resStub()),
  getAllPayout: jest.fn().mockResolvedValue([PayoutStub()]),
  getVendorPayout: jest.fn().mockResolvedValue([PayoutStub()]),
  payoutOverview: jest.fn().mockResolvedValue(PayoutOverviewStub())
}

export const VendorPayoutService = jest.fn().mockReturnValue(mockValue)
