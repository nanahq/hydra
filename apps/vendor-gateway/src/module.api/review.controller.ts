import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import {
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  Review,
  Vendor
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { CurrentUser } from './current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('review')
export class ReviewController {
  constructor (
    @Inject(QUEUE_SERVICE.REVIEW_SERVICE)
    private readonly reviewClient: ClientProxy
  ) {}

  @Get('listing/:listingId')
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

  @Get('vendor/:vid')
  @UseGuards(JwtAuthGuard)
  async getVendorReviews (@CurrentUser() vendor: Vendor): Promise<Review[]> {
    return await lastValueFrom<Review[]>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_GET_VENDOR_REVIEWS, { vendorId: vendor._id })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('stats/vendor/:vid')
  @UseGuards(JwtAuthGuard)
  async statGetVendorReviews (
    @Param('vid') vendorId: string
  ): Promise<any> {
    return await lastValueFrom<any>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS, { vendorId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('stats/listing/:lid')
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

  @Get(':id')
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
}
