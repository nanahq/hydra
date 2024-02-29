import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { PaymentRepository } from '../../charge/charge.repository'
import { PaymentModel } from '../../shared/support/charge.model'
import { PaymentStub } from '../../shared/stub/charge.stub'
import { Payment } from '@app/common'

describe('Payment Services - Repository', () => {
  let chargeRepository: PaymentRepository

  describe('operations', () => {
    let paymentModel: PaymentModel
    let paymentFilterQuery: FilterQuery<Payment>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          PaymentRepository,
          {
            provide: getModelToken(Payment.name),
            useClass: PaymentModel
          }
        ]
      }).compile()

      chargeRepository = moduleRef.get<PaymentRepository>(PaymentRepository)
      paymentModel = moduleRef.get<PaymentModel>(getModelToken(Payment.name))

      paymentFilterQuery = {
        _id: PaymentStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let user: Payment | null

        beforeEach(async () => {
          jest.spyOn(paymentModel, 'findOne')
          user = await chargeRepository.findOne(paymentFilterQuery)
        })

        test('then it should return a payments ', () => {
          expect(user).toEqual(PaymentStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let user: Payment[]

        beforeEach(async () => {
          jest.spyOn(paymentModel, 'find')
          user = await chargeRepository.find(paymentFilterQuery)
        })

        test('then it should return a payment', () => {
          expect(user).toEqual([PaymentStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let user: Payment
        beforeEach(async () => {
          jest.spyOn(paymentModel, 'findOne')
          user = await chargeRepository.findOneAndUpdate(paymentFilterQuery, {
            ...PaymentStub()
          })
        })

        test('then it should return an updated payment', () => {
          expect(user).toEqual(PaymentStub())
        })
      })
    })

    describe('create operations', () => {
      beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            PaymentRepository,
            {
              provide: getModelToken(Payment.name),
              useValue: PaymentModel
            }
          ]
        }).compile()

        chargeRepository = moduleRef.get<PaymentRepository>(PaymentRepository)
      })

      describe('create', () => {
        describe('when create is called', () => {
          let payment: Payment
          let saveSpy: jest.SpyInstance
          let constructorSpy: jest.SpyInstance

          beforeEach(async () => {
            saveSpy = jest.spyOn(PaymentModel.prototype, 'save')
            constructorSpy = jest.spyOn(
              PaymentModel.prototype,
              'constructorSpy'
            )
            payment = await chargeRepository.create(PaymentStub())
          })

          test('then it should call the paymentModel', () => {
            expect(saveSpy).toHaveBeenCalled()
            expect(constructorSpy).toHaveBeenCalled()
          })

          test('then it should return a payment', () => {
            expect(payment).toEqual(PaymentStub())
          })
        })
      })
    })
  })
})
