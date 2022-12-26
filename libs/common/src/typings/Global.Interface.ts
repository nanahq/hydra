import { ListingEntity, VendorEntity } from '@app/common'

export interface TokenPayload {
  userId: string
}

export interface VendorWithListing {
  vendor: VendorEntity
  listing: ListingEntity
}

export interface ReviewToken {
  listingId: string
}
