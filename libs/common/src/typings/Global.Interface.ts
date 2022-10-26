import { VendorEntity, ListingEntity } from '@app/common'

export interface TokenPayload {
  userId: string
}

export interface VendorWithListing {
  vendor: VendorEntity
  listing: ListingEntity
}
