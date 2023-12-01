import { ResponseWithStatus, Review, VendorReviewOverview } from '@app/common'
import { type Types } from 'mongoose'

export function ReviewStub (): Review {
  const objectId = '63f93c9f248f6c43d0b76502' as unknown as Types.ObjectId
  return {
    _id: objectId,
    createdAt: '2023-03-05T04:26:02.148Z',
    updatedAt: '2023-03-05T04:34:34.002Z',
    reviewBody: 'Good food and fast delivery',
    reviewerName: 'Musa, Isa',
    reviewStars: 5,
    listing: objectId as unknown as string,
    order: objectId as unknown as string,
    vendor: objectId as unknown as string
  }
}

export function resStub (): ResponseWithStatus {
  return { status: 1 }
}

export function VendorReviewOverviewsStub (): VendorReviewOverview {
  return {
    rating: '5',
    numberOfReviews: 120,
    riskFactor: 'HIGH'
  }
}
