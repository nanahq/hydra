import { OrderType, VendorOperationType, OrderStatus } from '@app/common'
import { ListingApprovalStatus } from '@app/common/typings/ListingApprovalStatus.enum'

export interface ListingOption {
  name: string
  price: string
}

export interface PaymentInfo {
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
}

export interface VendorOperationSetting {
  startTime?: string
  cutoffTime?: string
  placementTime?: string
  minOrder?: number
  preparationTime?: number
  deliveryType?: VendorOperationType
}

export interface LocationCoordinates {
  type: 'Point'
  coordinates: [number, number]
}

export interface ListingCategoryI {
  _id: string
  vendor: VendorI
  name: string
  tags: string[]
  isLive: boolean
  listingsMenu: ListingMenuI[]
  createdAt: string
  updatedAt: string
}

export interface ListingOptionGroupI {
  _id: string
  vendorId: string
  name: string
  min: number
  max: number
  options: ListingOption[]
}

export interface ListingMenuI {
  _id: string
  vendorId: string
  name: string
  desc: string
  price: string
  serving: string
  photo: string
  isLive: boolean
  isAvailable: boolean
  isDeleted: boolean
  optionGroups: ListingOptionGroupI[]
  createdAt: string
  updatedAt: string

  status: ListingApprovalStatus
}

export interface OrderBreakDown {
  orderCost: number
  systemFee: number
  deliveryFee: number
  vat: number
}

export interface VendorI {
  _id: string
  firstName: string
  lastName: string
  email: string
  businessEmail: string
  password: string
  phone: string
  isValidated: boolean
  status: 'ONLINE' | 'OFFLINE'
  businessName: string
  businessLogo?: string
  businessAddress: string
  settings?: VendorSettingsI
  location?: LocationCoordinates
  createdAt?: string
  updatedAt?: string

  expoNotificationToken: string
}

export interface VendorSettingsI {
  _id: string
  vendorId: string
  operations?: VendorOperationSetting
  payment?: PaymentInfo
}

export interface VendorUserI {
  _id: string
  isValidated: boolean
  status: 'ONLINE' | 'OFFLINE'
  businessName: string
  businessLogo: string

  businessImage: string
  businessAddress: string
  location: LocationCoordinates

  ratings: {
    totalReviews: number
    rating: number
  }
}

export interface UserI {
  _id: string
  firstName: string
  lastName: string
  email: string
  password?: string
  phone: string
  isValidated: boolean
  createdAt: string
  updatedAt: string
  status: 'ONLINE' | 'OFFLINE'
  isDeleted: boolean
  orders: OrderI[]
  location?: LocationCoordinates
  expoNotificationToken?: string
}

export interface ReviewI {
  _id: string
  reviewBody: string
  listingId: ListingMenuI
  vendorId: VendorI
  reviewStars: number
  orderId: OrderI
  reviewerName: string
  createdAt: string
  updatedAt: string
}
export interface OrderI {
  _id: string
  user: UserI
  listing: ListingMenuI
  vendor: VendorI
  totalOrderValue: number
  orderValuePayable: number
  deliveryAddress: string
  primaryContact: string
  isThirdParty: boolean
  createdAt: string
  updatedAt: string
  refId: number
  options: string[]
  orderStatus: OrderStatus
  orderBreakDown: OrderBreakDown
  orderType: OrderType
  orderDeliveryScheduledTime: string
  preciseLocation: LocationCoordinates
  quantity: string
  specialNote?: string
  txRefId?: string
}

export interface ListingMenuReview {
  rating: string
  numberOfReviews: number
  reviews: ReviewI[]
}

export interface VendorReviewOverview {
  rating: string
  numberOfReviews: number
  riskFactor: 'HIGH' | 'MEDIUM' | 'LOW'
}
