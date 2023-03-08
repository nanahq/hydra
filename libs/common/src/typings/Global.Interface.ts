import { ListingCategory, Vendor } from '@app/common'

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
export type VendorOperationType = 'PRE_ORDER' | 'ON_DEMAND' | 'PRE_AND_INSTANT'
