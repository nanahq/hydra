import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, Review } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class ReviewRepository extends AbstractRepository<Review> {
  protected readonly logger = new Logger(ReviewRepository.name)

  constructor (
  @InjectModel(Review.name) ReviewModel: Model<Review>,
    @InjectConnection() connection: Connection
  ) {
    super(ReviewModel, connection)
  }
}
