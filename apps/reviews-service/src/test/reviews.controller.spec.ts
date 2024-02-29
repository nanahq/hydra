import { Test } from '@nestjs/testing'
import { ReviewsService } from '../reviews-service.service'
import { ReviewsServiceController } from '../reviews-service.controller'
import {
  ResponseWithStatus,
  Review,
  ReviewDto,
  ReviewToken,
  RmqService,
  VendorReviewOverview
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import {
  resStub,
  ReviewStub,
  VendorReviewOverviewsStub
} from './stubs/reviews.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../reviews-service.service')

describe('reviewsServiceController', () => {
  let reviewsController: ReviewsServiceController
  let reviewsService: ReviewsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ReviewsServiceController],
      providers: [ReviewsService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    reviewsController = moduleRef.get<ReviewsServiceController>(
      ReviewsServiceController
    )
    reviewsService = moduleRef.get<ReviewsService>(ReviewsService)
    jest.clearAllMocks()
  })

  describe('Create', () => {
    describe('When creating a new  review', () => {
      let response: ResponseWithStatus
      let payload: ReviewDto
      let context: RmqContext
      beforeEach(async () => {
        payload = {
          vendor: ReviewStub().vendor,
          listing: ReviewStub().listing,
          order: ReviewStub().order,
          reviewBody: 'Amazing food. Good food.',
          reviewStars: 5
        }

        response = await reviewsController.createReview(payload, context)
      })
      test('then it should call reviewssService.register', () => {
        expect(reviewsService.create).toBeCalledWith(payload)
      })

      test('then is should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('getListingReviews', () => {
    describe('when getting a listing review', () => {
      let response: Review[]
      let data: ReviewToken
      let context: RmqContext

      beforeEach(async () => {
        data = {
          listingId: ''
        }
        response = await reviewsController.getListingReviews(data, context)
      })
      test('then it should call reviewsService.getListingReviews', () => {
        expect(reviewsService.getListingReviews).toHaveBeenCalledWith(
          data.listingId
        )
      })

      test('then it should return an array of reviews', () => {
        expect(response).toStrictEqual([ReviewStub()])
      })
    })
  })

  describe('getVendorReviews', () => {
    describe('when getting  vendor reviews ', () => {
      let response: Review[]
      let payload: { vendorId: string }
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          vendorId: ReviewStub().vendor
        }

        response = await reviewsController.getVendorReviews(payload, context)
      })
      test('then it should call reviewsService.getVendorReviews', () => {
        expect(reviewsService.getVendorReviews).toHaveBeenCalledWith(
          payload.vendorId
        )
      })

      test('then it should get all vendors reviews', () => {
        expect(response).toStrictEqual([ReviewStub()])
      })
    })
  })

  describe('getAllReviewsInDB', () => {
    describe('when a single reviews by ID', () => {
      let response: Review[]
      let context: RmqContext

      beforeEach(async () => {
        response = await reviewsController.getAllReviewsInDB(context)
      })
      test('then it should call reviewsService.getAllReviews', () => {
        expect(reviewsService.getAllReviews).toHaveBeenCalled()
      })

      test('then it should return a Array of reviews', () => {
        expect(response).toStrictEqual([ReviewStub()])
      })
    })
  })

  describe('getReviewInfo', () => {
    describe('When getting a single review by ID', () => {
      let response: Review | null
      let payload: { reviewId: string }
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          reviewId: ReviewStub()._id as unknown as string
        }
        response = await reviewsController.getReviewInfo(
          payload as any,
          context
        )
      })
      test('then it should call reviewsService.findOneById', () => {
        expect(reviewsService.findOneById).toHaveBeenCalledWith(
          payload.reviewId
        )
      })

      test('then it should find a review', () => {
        expect(response).toStrictEqual(ReviewStub())
      })
    })
  })

  describe('deleteReview', () => {
    describe('When  deleting a review', () => {
      let response: { status: number }
      let payload: { reviewId: string }
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          reviewId: '67809dcnisjo89'
        }
        response = await reviewsController.deleteReview(payload, context)
      })
      test('then it should call reviewsService.deleteReviewById', () => {
        expect(reviewsService.deleteReviewById).toHaveBeenCalledWith(
          payload.reviewId
        )
      })

      test('then it should return success status 1', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('getVendorReviewOverview', () => {
    describe('When getting vendors reviews overview', () => {
      let response: VendorReviewOverview
      let data: { vendorId: string }
      let context: RmqContext

      beforeEach(async () => {
        data = {
          vendorId: '0809599696'
        }
        response = await reviewsController.getVendorReviewOverview(
          data,
          context
        )
      })
      test('then it should call reviewsService.getVendorReviewOverview', () => {
        expect(reviewsService.getVendorReviewOverview).toHaveBeenCalledWith(
          data.vendorId
        )
      })

      test('then it should return a review overview', () => {
        expect(response).toStrictEqual(VendorReviewOverviewsStub())
      })
    })
  })

  describe('statGetListingReviews', () => {
    describe('When getting listings reviews stats', () => {
      let response: { sum_listing_reviews: string }
      let data: { listingId: string }
      let context: RmqContext

      beforeEach(async () => {
        data = {
          listingId: '0809599696'
        }
        response = await reviewsController.statGetListingReviews(data, context)
      })
      test('then it should call reviewsService.statGetListingReviews', () => {
        expect(reviewsService.statGetListingReviews).toHaveBeenCalledWith(
          data.listingId
        )
      })

      test('then it should return a review stats', () => {
        expect(response).toStrictEqual({ sum_listing_reviews: '500' })
      })
    })
  })
})
