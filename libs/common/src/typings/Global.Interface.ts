import { ListingCategory, Order, Vendor, ListingMenuI, LocationCoordinates, OrderI, UserI, VendorI  } from '@app/common'

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

export interface SendPayoutEmail {
  vendorName: string
  vendorId: string
  vendorEmail: string
  payoutDate: string
  payoutAmount: string
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
  orders: Order[]
  maxDeliveryTime: number
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
}
