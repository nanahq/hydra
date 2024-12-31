import {
  ListingOption,
  LocationCoordinates, OrderBreakDown,
  OrderStatus,
  OrderType,
  PaymentInfo,
  VendorOperationSetting,
  DriverType, AdminLevel, ListingApprovalStatus, OrderOptions,
  VendorApprovalStatusEnum,
  FleetOrderType,
} from '../typings'
export interface ListingCategoryI {
  _id: string
  vendor: VendorI
  name: string
  tags: string[]
  isLive: boolean
  listingsMenu: ListingMenuI[]
  createdAt: string
  updatedAt: string
  type: 'PRE_ORDER' | 'ON_DEMAND'
  isDeleted: boolean
}

export interface ListingOptionGroupI {
  _id: string
  vendorId: string
  name: string
  min: number
  max: number
  options: ListingOption[]
  isDeleted: boolean

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
  optionGroups: ListingOptionGroupI[]
  createdAt: string
  reviews: ReviewI[]
  updatedAt: string

  status: ListingApprovalStatus

  rejection_reason: string
}

export interface VendorI {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isValidated: boolean
  status: 'ONLINE' | 'OFFLINE'
  businessName: string
  businessLogo?: string
  businessAddress: string
  restaurantImage: string
  isDeleted: boolean

  rejection_reason: string
  acc_status: VendorApprovalStatusEnum
  expoNotificationToken: string
  settings?: VendorSettingsI
  location?: {
    coordinates: [string, string]
  }
  createdAt?: string
  updatedAt?: string

  reviews: ReviewI[]
}

export interface VendorSettingsI {
  _id: string
  vendor: VendorI
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
  ratings: VendorRatings

  reviews: ReviewI[]
  friendlyId: string
}

export interface VendorRatings {
  rating: number
  totalReviews: number
}
export interface UserI {
  _id: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  isValidated: boolean
  createdAt: string
  updatedAt: string
  status: 'ONLINE' | 'OFFLINE'
  isDeleted: boolean
  orders: OrderI[]
  location: LocationCoordinates

  paystack_customer_id?: string

  paystack_titan?: string

  expoNotificationToken?: string
  coupons?: CouponI[]
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
  listing: ListingMenuI[]
  vendor: VendorI
  totalOrderValue: number
  orderValuePayable: number
  deliveryAddress: string
  primaryContact: string
  isThirdParty: boolean
  createdAt: string
  updatedAt: string
  refId: number
  options: OrderOptions[]
  orderStatus: OrderStatus
  orderType: OrderType
  orderBreakDown: OrderBreakDown
  orderDeliveryScheduledTime: string
  preciseLocation: LocationCoordinates
  quantity: Array<{
    listing: string
    quantity: number
  }>
  specialNote?: string
  txRefId?: string

  coupon?: string
  review?: ReviewI
  fleetOrderType: FleetOrderType
}

export interface DeliveryI {
  _id: string
  user: UserI

  driver: DriverI

  order: OrderI

  listing: ListingMenuI[]

  vendor: VendorI

  createdAt: string

  updatedAt: string

  status: OrderStatus

  pickupLocation: LocationCoordinates

  dropOffLocation: LocationCoordinates

  currentLocation: LocationCoordinates

  completed: boolean

  deliveredWithinTime: boolean

  deliveryTime: string

  driverAccepted: boolean

  deliveryType: OrderType
  assignedToDriver: boolean
  travelMeta?: {
    distance: number
    travelTime: number
  }
  pool: DriverI[]
  deliveryFee: number
}

export interface DriverI {
  _id: string
  available: boolean

  createdAt: string

  email: string

  firstName: string

  internal: boolean

  isDeleted: false

  isValidated: boolean

  lastName: string

  location: LocationCoordinates

  password: string

  phone: string

  nin: number

  state: string

  status: 'ONLINE' | 'OFFLINE'

  trips: DeliveryI[]

  acc_status: VendorApprovalStatusEnum

  totalTrips: number
  type: DriverType

  updatedAt: string

  payment?: PaymentInfo

  s2CellId: string

  organization?: string
}

export interface AdminI {
  _id: string
  firstName: string

  lastName: string

  userName: string

  password: string

  phone: string

  reviewStars: number

  level: AdminLevel

  createdAt: string

  lastLoggedIn: string

  updatedAt: string

  deletedAt: string
}

export interface AddressBookI {
  _id: string
  userId: UserI

  labelId: AddressLabelI

  labelName: string

  address: string

  plot_number?: number

  house_number?: number

  location: LocationCoordinates

  isDeleted: boolean

  createdAt: string

  updatedAt: string

  pin: number
}

export interface AddressLabelI {

  _id: string
  createdBy: UserI

  name: string

  desc?: string

  isDeleted: boolean

  createdAt: string

  updatedAt: string
}

export interface PaymentI {
  _id: string
  user: UserI

  order: OrderI

  type: string

  status: string

  chargedAmount: string

  updatedAt: string

  createdAt: string

  refId: string

  paymentId: string

  paymentMeta: string
}

export interface UserWalletI {
  _id: string
  user: UserI
  balance: number | string
}

export interface VendorPayoutI {
  _id: string

  vendor: VendorI

  earnings: number

  orders: OrderI[]
  paid: boolean

  updatedAt: string

  createdAt: string

  refId: number
}

export interface ScheduledListingI {
  _id: string

  vendor: VendorI

  listing: ListingMenuI

  quantity: number
  availableDate: number

  updatedAt: string

  createdAt: string

  soldOut: boolean

  remainingQuantity: number
}

export interface SubscriptionNotificationI {
  _id: string
  subscribers: UserI[]

  vendor: VendorI

  enabledByVendor: boolean

  createdAt: string

  updatedAt: string
}

export type WalletTransactionType = 'CREDIT' | 'DEBIT'

export interface DriverWalletTransactionI {
  driver: DriverI

  wallet: DriverWalletI

  amount: number

  refid: number

  createdAt: string

  updatedAt: string

  status: WalletTransactionStatus
  txType: WalletTransactionType
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

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',

  REJECTED = 'REJECTED'
}

export type CouponType = 'CASH' | 'FREE_SHIPPING' | 'PERCENTAGE'

export interface CouponI {
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

  listing?: ListingMenuI
}

export interface FleetOrganizationI {
  _id: string

  members: string[]

  owners: string[]

  name: string

  image: string

  password: string

  email: string

  accountApproved: boolean

  inviteLink: string

  drivers: string[]

  payment?: PaymentInfo
}


export interface FleetMemberI {
  _id: string

  firstName: string


  lastName: string

  phone: string


  email: string

  isOwner: boolean

  password: string

  organization: string
}

export interface FleetOrgStat {
  totalEarnings: number

  totalDeliveries: number

  driversEarnings: Record<string, number>

  totalDistance: number

  totalTimeSpent: number

  averageDeliveryDistance: number

  averageDeliveryTime: number

}
