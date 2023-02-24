import { HttpStatus, Injectable } from '@nestjs/common'
import { FitRpcException, ResponseWithStatus, Review } from '@app/common'
import { ReviewDto } from '@app/common/database/dto/review.dto'
import { ReviewRepository } from './review.repositoty'

@Injectable()
export class ReviewsService {
  constructor (
    private readonly reviewRepository: ReviewRepository
  ) {}

  async getAllReviews (): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({})
    } catch (error) {
      throw new FitRpcException('Can not process request, Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
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

  // async statGetVendorReviews (
  //   vendorId: string
  // ): Promise<{ sum_vendor_reviews: string }> {
  //   const stats = await this.statFetchVendorReviews(vendorId)

  //   if (stats === undefined) {
  //     throw new FitRpcException(
  //       'Failed to fetch vendor reviews',
  //       HttpStatus.BAD_REQUEST
  //     )
  //   }

  //   return stats
  // }

  // async statGetListingReviews (
  //   listingId: string
  // ): Promise<{ sum_listing_reviews: string }> {
  //   const stats = await this.statFetchListingReviews(listingId)

  //   if (stats === undefined) {
  //     throw new FitRpcException(
  //       'Failed fetch listing reviews',
  //       HttpStatus.BAD_REQUEST
  //     )
  //   }

  //   return stats
  // }
}
