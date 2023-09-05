import { Vendor, VendorApprovalStatus } from '@app/common'
import { Types } from 'mongoose'

export function VendorStub (): Partial<Vendor> | Vendor {
  const objectId = '63f7f2d0a0f1d5158f43cb7b' as unknown as Types.ObjectId
  return {
    _id: objectId,
    firstName: 'Suraj',
    lastName: 'Auwal',
    email: 'siradjiawoual@gmail.com',
    businessEmail: 'suraj@gmail.com',
    password: '',
    phone: '+2348107641933',
    isValidated: false,
    status: 'ONLINE',
    acc_status: VendorApprovalStatus.PENDING,
    businessName: 'Jay\'s Pizza',
    businessAddress: 'Tsamiyar boka',
    isDeleted: false
  }
}
