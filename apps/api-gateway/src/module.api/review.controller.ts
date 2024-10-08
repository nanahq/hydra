import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import {
  CurrentUser,
  IRpcException,
  ReviewDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  Review,
  User
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('review')
export class ReviewController {
  constructor (
    @Inject(QUEUE_SERVICE.REVIEW_SERVICE)
    private readonly reviewClient: ClientProxy
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create (
    @Body() data: ReviewDto,
      @CurrentUser() user: User
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_CREATE, data).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findOne (@Param('id') reviewId: string): Promise<Review> {
    return await lastValueFrom<Review>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('listings/:listingId')
  @UseGuards(JwtAuthGuard)
  async getListingReviews (
    @Param('listingId') listingId: string
  ): Promise<Review> {
    return await lastValueFrom<Review>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_GET_LISTING_REVIEWS, { listingId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('stats/vendor-reviews/:vid')
  @UseGuards(JwtAuthGuard)
  async statGetVendorReviews (
    @Param('vid') vendorId: string
  ): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS, { vendorId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('stats/listing-reviews/:lid')
  @UseGuards(JwtAuthGuard)
  async statGetListingReviews (
    @Param('lid') listingId: string
  ): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_STATS_GET_LISTING_REVIEWS, { listingId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('ping')
  async ping (): Promise<string> {
    return await lastValueFrom<any>(this.reviewClient.send(QUEUE_MESSAGE.REVIEW_SERVICE_REQUEST_PING, {}))
  }
}
