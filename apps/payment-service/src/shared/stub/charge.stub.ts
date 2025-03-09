import {
  ResponseWithStatus,
  Payment,
  BankTransferAccountDetails
} from '@app/common'
import { type Types } from 'mongoose'

export function PaymentStub (): Payment {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
    wallet: false,
    _id: objectId,
    createdAt: '2023-03-05T04:26:02.148Z',
    updatedAt: '2023-03-05T04:34:34.002Z',
    status: 'PAID',
    paymentId: '7732784',
    type: 'BANK_TRANSFER',
    chargedAmount: '3000',
    refId: '34904890',
    user: objectId._id as unknown as any,
    order: objectId._id as unknown as any,
    paymentMeta: ''
  }
}

export function BankTransferChargeStub (): BankTransferAccountDetails {
  return {
    transfer_amount: 100,
    transfer_bank: 'WEMA BANK',
    transfer_account: '37489204875',
    account_expiration: 40506700707,
    transfer_reference: 'NANA_T67Y78UHBJN'
  }
}

export function resStub (): ResponseWithStatus {
  return { status: 1 }
}
