import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FitRpcException, ResponseWithStatus, ReviewEntity } from '@app/common'
import { DeleteResult, InsertResult, Repository } from 'typeorm'
import { ReviewDto } from '@app/common/database/dto/review.dto'

@Injectable()
export class ReviewsService {
  constructor (
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>
  ) {}

  async getAll (): Promise<ReviewEntity[]> {
    return await this.reviewRepository.createQueryBuilder('reviews').getMany()
  }

  async getVendorReviews (vendorId: string): Promise<ReviewEntity[]> {
    const reviews = await this.fetchVendorReviews(vendorId)

    if (reviews === null) {
      throw new FitRpcException(
        'Failed to fetch reviews for given vendor',
        HttpStatus.BAD_REQUEST
      )
    }

    return reviews
  }

  async getListingReviews (listingId: string): Promise<ReviewEntity[]> {
    const reviews = await this.fetchListingReviews(listingId)

    if (reviews === null) {
      throw new FitRpcException(
        'Failed to fetch reviews for given vendor',
        HttpStatus.BAD_REQUEST
      )
    }

    return reviews
  }

  async findOneById (id: string): Promise<ReviewEntity | null> {
    const review = await this.getOneById(id)

    if (review === null) {
      throw new FitRpcException(
        'Review with id is not found',
        HttpStatus.NOT_FOUND
      )
    }

    return review
  }

  async deleteReviewById (reviewId: string): Promise<{ status: number }> {
    const deleteRequest = await this.deleteOneReviewById(reviewId)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete review.',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async create (data: ReviewDto): Promise<ResponseWithStatus> {
    const createRequest = await this.createReview(data)

    if (createRequest === null) {
      throw new FitRpcException(
        'Failed to create a new review.',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  async statGetVendorReviews (
    vendorId: string
  ): Promise<{ sum_vendor_reviews: string }> {
    const stats = await this.statFetchVendorReviews(vendorId)

    if (stats === undefined) {
      throw new FitRpcException(
        'Failed to fetch vendor reviews',
        HttpStatus.BAD_REQUEST
      )
    }

    return stats
  }

  async statGetListingReviews (
    listingId: string
  ): Promise<{ sum_listing_reviews: string }> {
    const stats = await this.statFetchListingReviews(listingId)

    if (stats === undefined) {
      throw new FitRpcException(
        'Failed fetch listing reviews',
        HttpStatus.BAD_REQUEST
      )
    }

    return stats
  }

  private async fetchVendorReviews (vendorId: string): Promise<ReviewEntity[]> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.vendorId = :id', { id: vendorId })
      .getMany()
  }

  private async fetchListingReviews (
    listingId: string
  ): Promise<ReviewEntity[]> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.listingId = :id', { id: listingId })
      .getMany()
  }

  private async getOneById (id: string): Promise<ReviewEntity | null> {
    return await this.reviewRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne()
  }

  private async deleteOneReviewById (reviewId: string): Promise<DeleteResult> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .delete()
      .where('id = :id', { id: reviewId })
      .execute()
  }

  private async createReview (data: ReviewDto): Promise<InsertResult> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .insert()
      .into(ReviewEntity)
      .values({ ...data })
      .returning('id')
      .execute()
  }

  private async statFetchVendorReviews (
    vendorId: string
  ): Promise<{ sum_vendor_reviews: string } | undefined> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.vendorId = :id', { id: vendorId })
      .select('COUNT(*)', 'sum_vendor_reviews')
      .getRawOne()
  }

  private async statFetchListingReviews (
    listingId: string
  ): Promise<{ sum_listing_reviews: string } | undefined> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.listingId = :id', { id: listingId })
      .select('COUNT(*)', 'sum_listing_reviews')
      .getRawOne<{ sum_listing_reviews: string }>()
  }
}
