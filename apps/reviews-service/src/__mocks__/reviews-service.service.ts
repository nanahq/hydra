import { ReviewsServiceI } from '@app/common'
import {
  resStub,
  ReviewStub,
  VendorReviewOverviewsStub
} from '../test/stubs/reviews.stub'

const mockValue: ReviewsServiceI = {
  create: jest.fn().mockResolvedValue(resStub()),
  deleteReviewById: jest.fn().mockResolvedValue(resStub()),
  getAllReviews: jest.fn().mockResolvedValue([ReviewStub()]),
  getVendorReviews: jest.fn().mockResolvedValue([ReviewStub()]),
  getListingReviews: jest.fn().mockResolvedValue([ReviewStub()]),
  findOneById: jest.fn().mockResolvedValue(ReviewStub()),
  getVendorReviewOverview: jest
    .fn()
    .mockResolvedValue(VendorReviewOverviewsStub()),
  statGetListingReviews: jest
    .fn()
    .mockResolvedValue({ sum_listing_reviews: '500' })
}
export const ReviewsService = jest.fn().mockReturnValue(mockValue)
