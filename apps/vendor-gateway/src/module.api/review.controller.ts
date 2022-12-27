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
    ReviewEntity,
    VendorEntity
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { CurrentUser } from './current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('reviews')
export class ReviewController {
    constructor (
        @Inject(QUEUE_SERVICE.REVIEWS_SERVICE)
        private readonly reviewClient: ClientProxy
    ) {}
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne (@Param('id') reviewId: string): Promise<ReviewEntity> {
        return await lastValueFrom<ReviewEntity>(
            this.reviewClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
                catchError((error: IRpcException) => {
                    throw new HttpException(error.message, error.status)
                })
            )
        )
    }
    @Get('listing-reviews/:listingId')
    @UseGuards(JwtAuthGuard)
    async getListingReviews (
        @Param('listingId') listingId: string
    ): Promise<ReviewEntity> {
        return await lastValueFrom<ReviewEntity>(
            this.reviewClient
                .send(QUEUE_MESSAGE.REVIEW_GET_LISTING_REVIEWS, { listingId })
                .pipe(
                    catchError((error: IRpcException) => {
                        throw new HttpException(error.message, error.status)
                    })
                )
        )
    }
    @Get('vendor-reviews/:vid')
    @UseGuards(JwtAuthGuard)
    async getVendorReviews (
        @CurrentUser() vendor: VendorEntity
    ): Promise<ReviewEntity[]> {
        return await lastValueFrom<ReviewEntity[]>(
            this.reviewClient
                .send(QUEUE_MESSAGE.REVIEW_GET_VENDOR_REVIEWS, { vendorId: vendor.id })
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
        @CurrentUser() {id}: VendorEntity
    ): Promise<{sum_vendor_reviews: string}> {
        return await lastValueFrom<{sum_vendor_reviews: string}>(
            this.reviewClient
                .send(QUEUE_MESSAGE.REVIEW_STATS_GET_VENDOR_REVIEWS, { vendorId: id })
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
    ): Promise<ReviewEntity[]> {
        return await lastValueFrom<ReviewEntity[]>(
            this.reviewClient
                .send(QUEUE_MESSAGE.REVIEW_STATS_GET_LISTING_REVIEWS, { listingId })
                .pipe(
                    catchError((error: IRpcException) => {
                        throw new HttpException(error.message, error.status)
                    })
                )
        )
    }

}
