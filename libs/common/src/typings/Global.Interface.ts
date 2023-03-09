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
