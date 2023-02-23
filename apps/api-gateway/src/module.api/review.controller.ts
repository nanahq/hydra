import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ReviewEntity,
  UserEntity,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ReviewDto } from '@app/common/database/dto/review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject(QUEUE_SERVICE.REVIEWS_SERVICE)
    private readonly reviewClient: ClientProxy,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() data: ReviewDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom<ResponseWithStatus>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_CREATE, data).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') reviewId: string): Promise<ReviewEntity> {
    return await lastValueFrom<ReviewEntity>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @Get('listing-reviews/:listingId')
  @UseGuards(JwtAuthGuard)
  async getListingReviews(
    @Param('listingId') listingId: string,
  ): Promise<ReviewEntity> {
    return await lastValueFrom<ReviewEntity>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_GET_LISTING_REVIEWS, { listingId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status);
          }),
        ),
    );
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<ReviewEntity[]> {
    return await lastValueFrom<ReviewEntity[]>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @Get('stats/vendor-reviews/:vid')
  @UseGuards(JwtAuthGuard)
  async statGetVendorReviews(
    @Param('vid') vendorId: string,
  ): Promise<ReviewEntity[]> {
    return await lastValueFrom<ReviewEntity[]>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS, { vendorId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status);
          }),
        ),
    );
  }

  @Get('stats/listing-reviews/:lid')
  @UseGuards(JwtAuthGuard)
  async statGetListingReviews(
    @Param('lid') listingId: string,
  ): Promise<ReviewEntity[]> {
    return await lastValueFrom<ReviewEntity[]>(
      this.reviewClient
        .send(QUEUE_MESSAGE.REVIEW_STATS_GET_LISTING_REVIEWS, { listingId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status);
          }),
        ),
    );
  }
}
