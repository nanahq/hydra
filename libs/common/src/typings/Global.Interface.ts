import { VendorEntity } from '@app/common/database/entities/Vendor'
import { ListingEntity } from '@app/common/database/entities/Listing'

export interface TokenPayload {
  userId: string
}

export interface VendorWithListing {
  vendor: VendorEntity,
  listing: ListingEntity
}
