import { Test } from '@nestjs/testing'

import {
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  VendorPayout
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import { VendorPayoutController as PayoutController } from '../payout.controller'
import { VendorPayoutService as PayoutService } from '../payout.service'
import { resStub } from '../../shared/stub/charge.stub'
import { PayoutStub } from '../../shared/stub/payout.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../payout.service.ts')

describe('payoutServiceController', () => {
  let payoutController: PayoutController
  let payoutService: PayoutService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [PayoutController],
      providers: [PayoutService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    payoutController = moduleRef.get<PayoutController>(PayoutController)
    payoutService = moduleRef.get<PayoutService>(PayoutService)
    jest.clearAllMocks()
  })

  describe('getVendorPayout', () => {
    describe('When getting vendor payouts', () => {
      let response: VendorPayout[]
      let payload: { vendorId: string }
      let context: RmqContext
      beforeEach(async () => {
        payload = {
          vendorId: PayoutStub()._id as unknown as string
        }

        response = await payoutController.getVendorPayout(payload, context)
      })
      test('then it should call payoutService.getVendorPayout', () => {
        expect(payoutService.getVendorPayout).toBeCalledWith(payload.vendorId)
      })

      test('then is should return payouts', () => {
        expect(response).toStrictEqual([PayoutStub()])
      })
    })
  })

  describe('getAllPayout', () => {
    describe('When getting vendor payouts', () => {
      let response: VendorPayout[]
      let context: RmqContext
      beforeEach(async () => {
        response = await payoutController.getAllPayout(context)
      })
      test('then it should call payoutService.getVendorPayout', () => {
        expect(payoutService.getAllPayout).toHaveBeenCalled()
      })

      test('then is should return payouts', () => {
        expect(response).toStrictEqual([PayoutStub()])
      })
    })
  })

  describe('updatePayoutStatus', () => {
    describe('when updating payout status', () => {
      let payload: { refId: number }
      let context: RmqContext
      let response: ResponseWithStatus
      beforeEach(async () => {
        payload = {
          refId: 6789
        }

        response = await payoutController.updatePayoutStatus(payload, context)
      })
      test('then it should call payoutService.updatePayoutStatus', () => {
        expect(payoutService.updatePayoutStatus).toHaveBeenCalledWith(
          payload.refId
        )
      })

      test('then is should return success', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })
  describe('createPayout', () => {
    describe('when creating payout', () => {
      let payload: ServicePayload<Partial<VendorPayout>>
      let context: RmqContext
      let response: ResponseWithStatus
      beforeEach(async () => {
        payload = {
          userId: '56798guh',
          data: {
            refId: 798678
          }
        }

        response = await payoutController.createPayout(payload, context)
      })
      test('then it should call payoutService.createPayout', () => {
        expect(payoutService.createPayout).toHaveBeenCalledWith({
          refId: payload.data.refId,
          vendor: payload.userId
        })
      })

      test('then is should return success', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })
})
