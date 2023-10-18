import { PayoutOverview, VendorPayout } from '@app/common'
import { Types } from 'mongoose'

export function PayoutStub (): VendorPayout {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId

  return {
    _id: objectId,
    vendor: objectId as unknown as string,
    earnings: 10000,
    paid: true,
    createdAt: '2023-03-05T04:26:02.148Z',
    updatedAt: '2023-03-05T04:34:34.002Z',
    refId: 6798304958
  }
}

export function PayoutOverviewStub (): PayoutOverview {
  return {
    '24_hours': 500,
    '7_days': 2000,
    '30_days': 30000
  }
}
