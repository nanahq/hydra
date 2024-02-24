import {
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  Admin,
  AdminLevel,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  Review
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('review')
export class ReviewsController {
  constructor (
    @Inject(QUEUE_SERVICE.REVIEW_SERVICE)
    private readonly reviewsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('reviews')
  async getAllReviews (): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getReview (@Param('id') reviewId: string): Promise<Review> {
    return await lastValueFrom<Review>(
      this.reviewsClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('vendor/:vendorId')
  @UseGuards(JwtAuthGuard)
  async getVendorReviews (
    @Param('vendorId') vendorId: string
  ): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_GET_VENDOR_REVIEWS, { vendorId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('listing/:listingId')
  @UseGuards(JwtAuthGuard)
  async getListingReviews (
    @Param('listingId') listingId: string
  ): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_GET_LISTING_REVIEWS, { listingId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteReview (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin,
      @Param('id') reviewId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_DELETE_ONE, { reviewId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
