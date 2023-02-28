import { ListingCategory, Vendor } from '@app/common';
export interface TokenPayload {
    userId: string;
}
export interface VendorWithListing {
    vendor: Vendor;
    listing: ListingCategory;
}
export interface ReviewToken {
    listingId: string;
}
