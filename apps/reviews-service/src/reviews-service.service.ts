import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FitRpcException, ResponseWithStatus, ReviewEntity } from '@app/common'
import { InsertResult, Repository } from 'typeorm'
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
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.vendorId = :id', { id: vendorId })
      .getMany()
  }

  async getListingReviews (listingId: string): Promise<ReviewEntity[]> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.listingId = :id', { id: listingId })
      .getMany()
  }

  async findOneById (id: string): Promise<ReviewEntity | null> {
    const review = await this.reviewRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne()

    if (review === null) {
      throw new FitRpcException(
        'Review with id is not found',
        HttpStatus.NOT_FOUND
      )
    }

    return review
  }

  async deleteReviewById (reviewId: string): Promise<{ status: number }> {
    const deleteRequest = await this.reviewRepository
      .createQueryBuilder('reviews')
      .delete()
      .where('id = :id', { id: reviewId })
      .execute()

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete listing. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async create (data: ReviewDto): Promise<ResponseWithStatus> {
    const createRequest = this.createReview(data)

    if (createRequest === null) {
      throw new FitRpcException(
        'Failed to create a new listing. Incorrect input',
        HttpStatus.BAD_REQUEST
      )
    }

    return { status: 1 }
  }

  async createReview (data: ReviewDto): Promise<InsertResult> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .insert()
      .into(ReviewEntity)
      .values({ ...data })
      .returning('id')
      .execute()
  }

  async statGetVendorReviews (vendorId: string): Promise<any> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .select('COUNT(reviews.vendorId)', 'vendor_reviews')
      .where('reviews.vendorId = :id', { id: vendorId })
      .getRawOne()
  }

  async statGetListingReviews (listingId: string): Promise<any> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .select('COUNT(reviews.listingId)', 'listing_reviews')
      .where('reviews.listingId = :id', { id: listingId })
      .getRawOne()
  }
}
