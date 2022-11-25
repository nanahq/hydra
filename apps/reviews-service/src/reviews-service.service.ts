import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FitRpcException, ReviewEntity } from '@app/common'
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

  async getListingReviews (listingId: string): Promise<ReviewEntity[]> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .where('reviews.listingId = :id', { id: listingId })
      .getMany()
  }

  async findOneById (id: string): Promise<ReviewEntity | null> {
    return await this.reviewRepository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne()
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

  async create (data: ReviewDto): Promise<InsertResult> {
    return await this.reviewRepository
      .createQueryBuilder('reviews')
      .insert()
      .into(ReviewEntity)
      .values({ ...data })
      .returning('id')
      .execute()
  }
}
