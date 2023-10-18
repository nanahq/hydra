import { MockModel } from '@app/common/database/test/support/mock.model'
import { Review } from '@app/common'
import { ReviewStub } from '../stubs/reviews.stub'

export class ReviewModel extends MockModel<Review> {
  protected entityStub = ReviewStub()
}
