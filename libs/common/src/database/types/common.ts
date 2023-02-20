export interface ListingOption {
  name: string
  price: string
}

export interface PaymentInfo {
  bankName: string
  bankAccountInfo: string
  bankAccountNumber: string
}

export interface VendorOperationSetting {
  startTime?: string
  cutoffTime?: string
  placementTime?: string
  minOrder?: number
}

export interface LocationCoordinates {
  coordinates: [string, string]
}
