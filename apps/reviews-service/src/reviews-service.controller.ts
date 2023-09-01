import { Controller, UseFilters } from '@nestjs/common'
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'

import { ReviewsService } from './reviews-service.service'
import {
  ExceptionFilterRpc,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  Review,
  ReviewToken,
  RmqService,
  VendorReviewOverview,
  ReviewDto
} from '@app/common'

@UseFilters(new ExceptionFilterRpc())
@Controller()
export class ReviewsServiceController {
  constructor (
    private readonly reviewService: ReviewsService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.REVIEW_GET_LISTING_REVIEWS)
  async getListingReviews (
    @Ctx() context: RmqContext,
      @Payload() { listingId }: ReviewToken
  ): Promise<Review[]> {
    try {
      return await this.reviewService.getListingReviews(listingId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_GET_VENDOR_REVIEWS)
  async getVendorReviews (
    @Ctx() context: RmqContext,
      @Payload() { vendorId }: { vendorId: string }
  ): Promise<Review[]> {
    try {
      return await this.reviewService.getVendorReviews(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB)
  async getAllReviewsInDB (@Ctx() context: RmqContext): Promise<Review[]> {
    try {
      return await this.reviewService.getAllReviews()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_FIND_ONE)
  async getReviewInfo (
    @Payload() { reviewId }: { reviewId: string },
      @Ctx() context: RmqContext
  ): Promise<Review | null> {
    try {
      return await this.reviewService.findOneById(reviewId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_DELETE_ONE)
  async deleteReview (
    @Payload() { reviewId }: { reviewId: string },
      @Ctx() context: RmqContext
  ): Promise<{ status: number }> {
    try {
      return await this.reviewService.deleteReviewById(reviewId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_CREATE)
  async createReview (
    @Payload() payload: ReviewDto,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.reviewService.create(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_STATS_GET_LISTING_REVIEWS)
  async statGetListingReviews (
    @Ctx() context: RmqContext,
      @Payload() { listingId }: { listingId: string }
  ): Promise<{ sum_listing_reviews: string }> {
    try {
      return await this.reviewService.statGetListingReviews(listingId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS)
  async getVendorReviewOverview (
    @Payload() { vendorId }: { vendorId: string },
      @Ctx() context: RmqContext
  ): Promise<VendorReviewOverview> {
    console.log('Hello world')
    try {
      return await this.reviewService.getVendorReviewOverview(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
