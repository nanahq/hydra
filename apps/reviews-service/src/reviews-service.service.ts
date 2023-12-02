import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  FitRpcException,
  ResponseWithStatus,
  Review,
  VendorReviewOverview,
  ReviewDto,
  ExportPushNotificationClient,
  QUEUE_SERVICE,
  QUEUE_MESSAGE,
  VendorI,
  PushMessage,
  ReviewsServiceI,
  ListingMenu, Vendor, ReviewI, ReviewServiceGetMostReviewed
} from '@app/common'
import { ReviewRepository } from './review.repositoty'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class ReviewsService implements ReviewsServiceI {
  protected readonly logger = new Logger(ReviewsService.name)
  constructor (
    private readonly reviewRepository: ReviewRepository,
    private readonly expoClient: ExportPushNotificationClient,
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy
  ) {}

  async getAllReviews (): Promise<Review[]> {
    try {
      return await this.reviewRepository.findAndPopulate({}, ['listing', 'order', 'vendor'])
    } catch (error) {
      console.log({ error })
      throw new FitRpcException(
        'Can not process request, Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getVendorReviews (vendor: string): Promise<Review[]> {
    try {
      return await this.reviewRepository.findAndPopulate({ vendor }, ['listing', 'order'])
    } catch (error) {
      throw new FitRpcException(
        'Can not process your request. Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getListingReviews (listing: string): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({ listing })
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
      const vendor = await lastValueFrom<VendorI>(this.vendorClient.send(QUEUE_MESSAGE.GET_VENDOR, { data: data.vendor }))

      await this.reviewRepository.create(data)

      // @todo(siradji) Move this push to notification service

      const pushMessage: PushMessage = {
        title: 'You got a new review',
        body: 'A customer just reviewed your listing',
        priority: 'normal'
      }
      await this.expoClient.sendSingleNotification(vendor.expoNotificationToken, pushMessage)
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Failed to create a new review.',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getVendorReviewOverview (
    vendor: string
  ): Promise<VendorReviewOverview> {
    const vendorReviews = (await this.reviewRepository.find({
      vendor
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
    } else if (vendorReviews.length > 0 && vendorReviews.length < 5) {
      aggregateRating = vendorReviews.length
      riskFactor = 'LOW'
    }

    return {
      riskFactor,
      rating: parseFloat(aggregateRating.toString()).toFixed(2),
      numberOfReviews: vendorReviews.length
    }
  }

  async getTopVendors (): Promise<Vendor[]> {
    try {
      const reviews: ReviewI[] = await this.reviewRepository.findAndPopulate({}, ['vendor'])

      if (reviews.length < 1) {
        return []
      }
      const vendorReviewCounts: Map<string, number> = new Map()

      reviews.forEach((review) => {
        const vendorId = review.vendor._id
        vendorReviewCounts.set(vendorId, (vendorReviewCounts.get(vendorId) ?? 0) + 1)
      })

      const vendorsWithReviewCount: any[] = Array.from(vendorReviewCounts.entries()).map(([vendorId, reviewCount]) => ({
        vendor: reviews.find((review) => review.vendor._id === vendorId)?.vendor,
        reviewCount
      }))

      vendorsWithReviewCount.sort((a, b) => b.reviewCount - a.reviewCount)

      const topVendors: Vendor[] = vendorsWithReviewCount.slice(0, 20).map((entry) => entry.vendor)

      return topVendors
    } catch (error) {
      this.logger.log(error)
      throw new FitRpcException(
        'Failed To Fetch Top vendors',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getTopListings (): Promise<ListingMenu[]> {
    try {
      const reviews: ReviewI[] = await this.reviewRepository.findAndPopulate({}, ['listing'])

      if (reviews.length < 1) {
        return []
      }
      const listingReviewCounts: Map<string, number> = new Map()

      reviews.forEach((review) => {
        const listingId = review.listing._id
        listingReviewCounts.set(listingId, (listingReviewCounts.get(listingId) ?? 0) + 1)
      })

      const listingWithReviewCountWithReviewCount: any[] = Array.from(listingReviewCounts.entries()).map(([listingId, reviewCount]) => ({
        listing: reviews.find((review) => review.listing._id === listingId)?.listing,
        reviewCount
      }))

      listingWithReviewCountWithReviewCount.sort((a, b) => b.reviewCount - a.reviewCount)

      const topListings: ListingMenu[] = listingWithReviewCountWithReviewCount.slice(0, 20).map((entry) => entry.listing)

      return topListings
    } catch (error) {
      this.logger.log(error)
      throw new FitRpcException(
        'Failed To Fetch Top vendors',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getTopHomepage (): Promise<ReviewServiceGetMostReviewed> {
    const vendors = await this.getTopVendors()
    return {
      listings: [],
      vendors
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
