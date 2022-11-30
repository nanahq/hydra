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
  ReviewEntity,
  ReviewToken,
  RmqService
} from '@app/common'
import { ReviewDto } from '@app/common/database/dto/review.dto'

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
  ): Promise<ReviewEntity[]> {
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
  ): Promise<ReviewEntity[]> {
    try {
      return await this.reviewService.getVendorReviews(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB)
  async getAllReviewsInDB (@Ctx() context: RmqContext): Promise<ReviewEntity[]> {
    try {
      return await this.reviewService.getAll()
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
  ): Promise<ReviewEntity | null> {
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

  @MessagePattern(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS)
  async statGetVendorReviews (
    @Ctx() context: RmqContext,
      @Payload() { vendorId }: { vendorId: string }
  ): Promise<ResponseWithStatus> {
    try {
      return await this.reviewService.statGetVendorReviews(vendorId)
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
  ): Promise<ResponseWithStatus> {
    try {
      return await this.reviewService.statGetListingReviews(listingId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
