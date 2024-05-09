import {
  CouponI,
  ListingCategory,
  ListingMenu,
  ListingMenuI,
  LocationCoordinates,
  OrderI,
  UserI,
  Vendor,
  VendorI,
  VendorUserI
} from '@app/common'

export interface IdPayload {
  id: string
}

export interface TokenPayload {
  userId: string
}

export interface VendorWithListing {
  vendor: Vendor
  listing: ListingCategory
}

export interface ReviewToken {
  listingId: string
}

export type OrderType = 'PRE_ORDER' | 'ON_DEMAND'

export enum OrderTypes {
  PRE = 'PRE_ORDER',
  INSTANT = 'ON_DEMAND',
}

export enum OrderPaymentType {
  PAY_ONLINE = 'PAY_ONLINE',
  PAY_BY_WALLET = 'PAY_BY_WALLET'
}

export interface SendPayoutEmail {
  vendorName: string
  vendorId: string
  vendorEmail: string
  payoutDate: string
  payoutAmount: string
  vendorBankDetails: string
}

export interface SendVendorSignUpEmail {
  vendorName: string
  vendorEmail: string
}

export interface PayoutOverview {
  '24_hours': number
  '7_days': number
  '30_days': number
}

export type VendorOperationType = 'PRE_ORDER' | 'ON_DEMAND' | 'PRE_AND_INSTANT'

export type DriverType = 'DELIVER_PRE_ORDER' | 'DELIVER_ON_DEMAND'

export interface OrderGroup {
  groupId: number
  orders: OrderI[]
  maxDeliveryTime: string
}

export interface DriverWithLocation {
  driverId: string | any
  coordinates: number[]
}

export interface TravelDistanceResult {
  distance?: number // in meters

  duration?: number // in minutes
  eta?: string
}

export interface DeliveryFeeResult {
  distance?: number // in meters

  duration?: number // in minutes
  fee: number // in naira
}
export interface ScheduledListingDto {
  vendor: string
  listing: string
  quantity: number
  availableDate: number
}

export interface DeliveryI {
  _id: string
  user: UserI

  driver: any

  order: OrderI

  listing: ListingMenuI

  vendor: VendorI

  createdAt: string

  updatedAt: string

  status: string

  pickupLocation: LocationCoordinates

  dropOffLocation: LocationCoordinates

  currentLocation: LocationCoordinates

  completed: boolean

  deliveredWithinTime: boolean

  deliveryTime: number

  assignedToDriver: boolean

  deliveryType: OrderType

  travelMeta?: {
    distance: number
    travelTime: number
  }
}

export interface DriverI {
  _id: string
  available: boolean

  createdAt: string

  email: string

  firstName: string

  isDeleted: false

  isValidated: boolean

  lastName: string

  location: LocationCoordinates

  password: string

  phone: string

  state: string

  status: 'ONLINE' | 'OFFLINE'

  trips: DeliveryI[]

  totalTrips: number
  type: DriverType

  updatedAt: string
}

export interface CheckUserAccountI {
  hasAccount: boolean
  firstName: string | undefined
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

export interface CartConstants {
  SERVICE_FEE: number
  VAT_FEE: number
}

export interface DeliveryPriceMeta {
  GAS_PRICE: number
  BASE_FEE: number
  SHORT_DISTANCE_RATE: number
  MEDIUM_DISTANCE_RATE: number
  LONG_DISTANCE_RATE: number
  MAX_DELIVERY_FEE_PAYABLE: number
}

export interface DriverCommissionMeta {
  commissionPerKm: 25 // 25 naira per each kilometre
}
export interface AppConstants {
  cart: CartConstants

  driver?: DriverCommissionMeta
  delivery: DeliveryPriceMeta
}

export interface ScheduledPushPayload {
  vendor: string
  listingName: string
  listingAvailableDate: number
}

export interface VendorSoldOutPush extends BasePushMessage {
  vendorName: string
  listingName: string
  listingAvailableDate: string
  listingQuantity: number
}

export interface BasePushMessage {
  token: string
}

export interface VendorApprovedPush extends BasePushMessage {
  vendorName: string
}

export interface VendorRejectPush extends BasePushMessage {
  vendorName: string

  rejectionReason: string
}

export interface ListingApprovePush extends BasePushMessage {
  vendorName: string
  listingName: string
}

export interface ListingRejectPush extends BasePushMessage {
  vendorName: string
  listingName: string
  rejectionReason: string
}

export interface UserHomePage {
  mostPopularVendors: VendorUserI[]

  instantDelivery: VendorUserI[]

  homeMadeChefs: VendorUserI[]

  fastestDelivery: VendorUserI[]

  allVendors: VendorUserI[]

  scheduledListingsTomorrow: ListingMenuI[]
}

export interface VendorServiceHomePageResult {
  nearest: VendorI[]
  allVendors: VendorI[]
}

export interface ReviewServiceGetMostReviewed {
  listings: ListingMenu[]
  vendors: Vendor[]
}

export interface DriverStats {
  distance: number
  time: number
  earnings: number
}

export interface DriverStatGroup {
  today: DriverStats
  yesterday: DriverStats
  week: DriverStats
  month: DriverStats
}
export interface DeliveryTaskStream {
  driverId: string
  vendorName: string

  orderId: string
}

export type CouponType = 'CASH' | 'FREE_SHIPPING' | 'PERCENTAGE'

export interface CouponRedeemResponse {
  coupon?: CouponI
  status: 'OK' | 'ERROR'
  message: string
}

export interface OverviewStatI {
  totalOrders: number
  totalListings: number
  totalUsers: number
  totalVendors: number
  totalPayouts: number
  totalRevenue: number
}

export interface DashboardStatI {
  overview: OverviewStatI
  vendor: VendorStatI
  user: UserStatI
  order: OrderStatI
  listing: ListingStatI
}

export interface VendorStatI {
  aggregateResult: number
  acceptedVendors: number
  rejectedVendors: number
  weeklySignup: number
  monthlySignup: number
}

export interface UserStatI {
  aggregateUsers: number
  weeklySignup: number
  monthlySignup: number
  usersWithOrders: number
}

export interface OrderStatI {
  aggregateOrders: number
  weeklyOrders: number
  monthlyOrders: number
}

export interface ListingStatI {
  approvedListings: number
  aggregateListings: number
}
