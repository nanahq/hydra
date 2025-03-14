import {
  OrderType,
  VendorOperationType,
  OrderStatus,
  DriverI,
  CouponType,
  FleetOrderType
} from '@app/common'

import { ListingApprovalStatus } from '@app/common/typings/ListingApprovalStatus.enum'

export interface UserVendorI extends VendorI {
  reviews: ReviewI[]
}
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
  nextDayDelivery: boolean
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
  vendor: VendorI
  name: string
  desc: string
  price: string
  serving: string
  photo: string
  isLive: boolean
  isAvailable: boolean
  isDeleted: boolean
  rejection_reason: string
  reviews: string
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
  friendlyId: string
}

export interface VendorWithListingsI extends VendorI {
  listings: ListingMenuI[]
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
  settings: VendorOperationSetting

  reviews: ReviewI[]
  ratings: {
    totalReviews: number
    rating: number
  }
  friendlyId: string
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

  paystack_customer_id?: string

  paystack_titan?: string
  favourites?: ListingMenuI[]
}

export interface ReviewI {
  _id: string
  reviewBody: string
  listing: ListingMenuI
  vendor: VendorI
  reviewStars: number
  order: OrderI
  reviewerName: string
  createdAt: string
  updatedAt: string
}
export interface OrderI {
  _id: string
  user: UserI
  listing: [ListingMenuI]
  vendor: VendorI
  totalOrderValue: number
  orderValuePayable: number
  deliveryAddress: string
  pickupAddress: string
  primaryContact: string
  isThirdParty: boolean
  createdAt: string
  updatedAt: string
  refId: number
  options: OrderOptions[]
  orderStatus: OrderStatus
  orderBreakDown: OrderBreakDown
  orderType: OrderType
  orderDeliveryScheduledTime: string
  preciseLocation: LocationCoordinates

  precisePickupLocation: LocationCoordinates
  quantity: [
    {
      listing: string
      quantity: number
    },
  ]
  specialNote?: string
  txRefId?: string

  coupon?: string
  review?: ReviewI
  fleetOrderType: FleetOrderType
  itemDescription?: string
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

export interface OrderOptions {
  listing: string
  options: string[]
}

export interface SubscriptionNotification {
  _id: string
  subscribers: UserI[]
  vendor: VendorI

  enabledByVendor: boolean

  createdAt: string

  updatedAt: string
}

export interface OrderUpdateStream {
  userId: string
  orderId: string
  status: OrderStatus
  driver?: string
  vendorName?: string
}

export type WalletTransactionType = 'CREDIT' | 'DEBIT'

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',

  REJECTED = 'REJECTED',
}
export interface DriverWalletTransactionI {
  driver: DriverI

  wallet: DriverWalletI

  amount: number

  refid: number

  createdAt: string

  updatedAt: string

  txType: WalletTransactionType

  status: WalletTransactionStatus
  transaction: string
}
export interface DriverWalletI {
  driver: DriverI

  transactions: DriverWalletTransactionI[]

  createdAt: string

  updatedAt: string

  balance: number

  logs: string[]
}

export interface CouponI {
  expired: boolean
  _id: string

  code: string

  useOnce: boolean

  users: string[]

  type: CouponType

  value?: number

  percentage?: number

  validFrom: string

  validTill: string

  createdAt: string

  updatedAt: string
}
