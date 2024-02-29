import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { VendorPayoutRepository as PayoutRepository } from '../payout.repository'
import { PayoutModel } from '../../shared/support/payout.model'
import { PayoutStub } from '../../shared/stub/payout.stub'
import { VendorPayout } from '@app/common'

describe('Payout Services - Repository', () => {
  let chargeRepository: PayoutRepository

  describe('operations', () => {
    let payoutModel: PayoutModel
    let paymentFilterQuery: FilterQuery<VendorPayout>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          PayoutRepository,
          {
            provide: getModelToken(VendorPayout.name),
            useClass: PayoutModel
          }
        ]
      }).compile()

      chargeRepository = moduleRef.get<PayoutRepository>(PayoutRepository)
      payoutModel = moduleRef.get<PayoutModel>(
        getModelToken(VendorPayout.name)
      )

      paymentFilterQuery = {
        _id: PayoutStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let user: VendorPayout | null

        beforeEach(async () => {
          jest.spyOn(payoutModel, 'findOne')
          user = await chargeRepository.findOne(paymentFilterQuery)
        })

        test('then it should return a payouts ', () => {
          expect(user).toEqual(PayoutStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let user: VendorPayout[]

        beforeEach(async () => {
          jest.spyOn(payoutModel, 'find')
          user = await chargeRepository.find(paymentFilterQuery)
        })

        test('then it should return a payouts', () => {
          expect(user).toEqual([PayoutStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let user: VendorPayout
        beforeEach(async () => {
          jest.spyOn(payoutModel, 'findOne')
          user = await chargeRepository.findOneAndUpdate(paymentFilterQuery, {
            ...PayoutStub()
          })
        })

        test('then it should return an updated payouts', () => {
          expect(user).toEqual(PayoutStub())
        })
      })
    })

    describe('create operations', () => {
      beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
          providers: [
            PayoutRepository,
            {
              provide: getModelToken(VendorPayout.name),
              useValue: PayoutModel
            }
          ]
        }).compile()

        chargeRepository = moduleRef.get<PayoutRepository>(PayoutRepository)
      })

      describe('create', () => {
        describe('when create is called', () => {
          let payment: VendorPayout
          let saveSpy: jest.SpyInstance
          let constructorSpy: jest.SpyInstance

          beforeEach(async () => {
            saveSpy = jest.spyOn(PayoutModel.prototype, 'save')
            constructorSpy = jest.spyOn(
              PayoutModel.prototype,
              'constructorSpy'
            )
            payment = await chargeRepository.create(PayoutStub())
          })

          test('then it should call the payoutModel', () => {
            expect(saveSpy).toHaveBeenCalled()
            expect(constructorSpy).toHaveBeenCalled()
          })

          test('then it should return a payout', () => {
            expect(payment).toEqual(PayoutStub())
          })
        })
      })
    })
  })
})
