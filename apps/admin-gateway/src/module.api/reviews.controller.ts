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
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ReviewEntity
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('reviews')
export class ReviewsController {
  constructor (
    @Inject(QUEUE_SERVICE.REVIEWS_SERVICE)
    private readonly reviewsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAllReviews (): Promise<ReviewEntity[]> {
    return await lastValueFrom<ReviewEntity[]>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB, {})
        .pipe(
          catchError((error: IRpcException) => {
            console.log(error)
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReview (@Param('id') reviewId: string): Promise<ReviewEntity> {
    return await lastValueFrom<ReviewEntity>(
      this.reviewsClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReview (
    @Param('id') reviewId: string
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.reviewsClient
        .send(QUEUE_MESSAGE.REVIEW_DELETE_ONE, { reviewId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
