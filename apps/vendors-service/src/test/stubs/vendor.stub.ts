import { Vendor, VendorApprovalStatus } from '@app/common'
import { Types } from 'mongoose'

export function VendorStub (): Vendor {
  const objectId = '63f7f2d0a0f1d5158f43cb7b' as unknown as Types.ObjectId
  return {
    reviews: [],
    _id: objectId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    password: 'password123',
    phone: '+1234567890',
    isValidated: true,
    createdAt: '',
    updatedAt: '',
    status: 'ONLINE',
    acc_status: VendorApprovalStatus.PENDING,
    rejection_reason: 'Not approved',
    businessName: 'Business Name',
    businessLogo: 'business_logo.jpg',
    businessAddress: '123 Main Street',
    restaurantImage: 'restaurant_image.jpg',
    isDeleted: false,
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    settings: '63f7f2d0a0f1d5158f43cb7b',
    expoNotificationToken: 'expo_token',
    friendlyId: 'friendly-id'
  }
}
