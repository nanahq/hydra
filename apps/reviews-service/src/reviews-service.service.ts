import { HttpStatus, Injectable } from '@nestjs/common'
import {
  FitRpcException,
  ResponseWithStatus,
  Review,
  VendorReviewOverview,
  ReviewDto
} from '@app/common'
import { ReviewRepository } from './review.repositoty'

@Injectable()
export class ReviewsService {
  constructor (private readonly reviewRepository: ReviewRepository) {}

  async getAllReviews (): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({})
    } catch (error) {
      throw new FitRpcException(
        'Can not process request, Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getVendorReviews (vendorId: string): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({ vendorId })
    } catch (error) {
      throw new FitRpcException(
        'Can not process your request. Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getListingReviews (listingId: string): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({ listingId })
    } catch (error) {
      throw new FitRpcException(
        'Can not process your request. Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOneById (_id: any): Promise<Review | null> {
    try {
      return await this.reviewRepository.findOne({ _id })
    } catch (error) {
      throw new FitRpcException(
        'Can not process your request. Try Again Later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteReviewById (reviewId: any): Promise<{ status: number }> {
    try {
      await this.reviewRepository.delete(reviewId)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Failed to delete review.',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
  }

  async create (data: ReviewDto): Promise<ResponseWithStatus> {
    try {
      await this.reviewRepository.create(data)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Failed to create a new review.',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getVendorReviewOverview (
    vendorId: string
  ): Promise<VendorReviewOverview> {
    const vendorReviews = (await this.reviewRepository.find({
      vendorId
    })) as Review[]

    let aggregateRating: number = 0

    let riskFactor: 'HIGH' | 'LOW' | 'MEDIUM' = 'MEDIUM'

    if (vendorReviews.length >= 5) {
      for (const review of vendorReviews) {
        aggregateRating += review.reviewStars
      }

      aggregateRating = aggregateRating / vendorReviews.length

      if (aggregateRating >= 4) {
        riskFactor = 'LOW'
      } else if (aggregateRating < 4 && aggregateRating > 2.5) {
        riskFactor = 'MEDIUM'
      } else {
        riskFactor = 'HIGH'
      }
    }

    return {
      riskFactor,
      rating: parseFloat(aggregateRating.toString()).toFixed(2),
      numberOfReviews: vendorReviews.length
    }
  }

  async statGetListingReviews (listingId: string): Promise<any> {
    const listingReview = (await this.reviewRepository.find({
      listingId
    })) as Review[]

    let aggregateRating: number = 0
    for (const review of listingReview) {
      aggregateRating += review.reviewStars
    }
    aggregateRating = aggregateRating / listingReview.length

    return {
      rating: parseFloat(aggregateRating.toString()).toFixed(2),
      numberOfReviews: listingReview.length,
      reviews: listingReview
    }
  }
}
