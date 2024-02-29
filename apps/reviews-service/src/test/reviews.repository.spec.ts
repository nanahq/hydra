import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { ReviewRepository } from '../review.repositoty'
import { ReviewModel } from './support/reviews.model'
import { ReviewStub } from './stubs/reviews.stub'
import { Review } from '@app/common'

describe('Review Services - Repository', () => {
  let reviewsRepository: ReviewRepository

  describe('operations', () => {
    let reviewsModel: ReviewModel
    let reviewsFilterQuery: FilterQuery<Review>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          ReviewRepository,
          {
            provide: getModelToken(Review.name),
            useClass: ReviewModel
          }
        ]
      }).compile()

      reviewsRepository = moduleRef.get<ReviewRepository>(ReviewRepository)
      reviewsModel = moduleRef.get<ReviewModel>(getModelToken(Review.name))

      reviewsFilterQuery = {
        _id: ReviewStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let user: Review | null

        beforeEach(async () => {
          jest.spyOn(reviewsModel, 'findOne')
          user = await reviewsRepository.findOne(reviewsFilterQuery)
        })

        test('then it should return a reviews ', () => {
          expect(user).toEqual(ReviewStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let user: Review[]

        beforeEach(async () => {
          jest.spyOn(reviewsModel, 'find')
          user = await reviewsRepository.find(reviewsFilterQuery)
        })

        test('then it should return a review', () => {
          expect(user).toEqual([ReviewStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let user: Review
        beforeEach(async () => {
          jest.spyOn(reviewsModel, 'findOne')
          user = await reviewsRepository.findOneAndUpdate(reviewsFilterQuery, {
            ...ReviewStub()
          })
        })

        test('then it should return an updated review', () => {
          expect(user).toEqual(ReviewStub())
        })
      })
    })

    describe('create operations', () => {
      beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            ReviewRepository,
            {
              provide: getModelToken(Review.name),
              useValue: ReviewModel
            }
          ]
        }).compile()

        reviewsRepository = moduleRef.get<ReviewRepository>(ReviewRepository)
      })

      describe('create', () => {
        describe('when create is called', () => {
          let user: Review
          let saveSpy: jest.SpyInstance
          let constructorSpy: jest.SpyInstance

          beforeEach(async () => {
            saveSpy = jest.spyOn(ReviewModel.prototype, 'save')
            constructorSpy = jest.spyOn(
              ReviewModel.prototype,
              'constructorSpy'
            )
            user = await reviewsRepository.create(ReviewStub())
          })

          test('then it should call the reviewsModel', () => {
            expect(saveSpy).toHaveBeenCalled()
            expect(constructorSpy).toHaveBeenCalled()
          })

          test('then it should return a review', () => {
            expect(user).toEqual(ReviewStub())
          })
        })
      })
    })
  })
})
