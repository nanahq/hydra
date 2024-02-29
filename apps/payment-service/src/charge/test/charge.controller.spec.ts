import { Test } from '@nestjs/testing'

import {
  BankTransferAccountDetails,
  BankTransferRequest,
  RmqService,
  SupportedBanks,
  UssdRequest
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import { PaymentController } from '../../charge/charge.controller'
import { PaymentService } from '../../charge/charge.service'
import { BankTransferChargeStub } from '../../shared/stub/charge.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../charge.service.ts')

describe('paymentServiceController', () => {
  let paymentController: PaymentController
  let paymentService: PaymentService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [PaymentController],
      providers: [PaymentService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    paymentController = moduleRef.get<PaymentController>(PaymentController)
    paymentService = moduleRef.get<PaymentService>(PaymentService)
    jest.clearAllMocks()
  })

  describe('create charge', () => {
    describe('When creating a bank transfer charge', () => {
      let response: BankTransferAccountDetails
      let payload: BankTransferRequest
      let context: RmqContext
      beforeEach(async () => {
        payload = {
          userId: '5678908976tgyuhijokl',
          orderId: 'fyvgubhijr5t678g9h'
        }

        response = await paymentController.chargeWithBankTransfer(
          payload,
          context
        )
      })
      test('then it should call paymentService.chargeWithBankTransfer', () => {
        expect(paymentService.chargeWithBankTransfer).toBeCalledWith(payload)
      })

      test('then is should return a charge request', () => {
        expect(response).toStrictEqual(BankTransferChargeStub())
      })
    })

    describe('When creating a ussd charge', () => {
      let response: any
      let payload: UssdRequest
      let context: RmqContext
      beforeEach(async () => {
        payload = {
          account_bank: SupportedBanks.ACCESS_BANK,
          orderId: '789h88uh9i',
          userId: '6tnc7w7273489',
          account_number: '4678756473897'
        }

        response = await paymentController.chargeWithUssd(payload, context)
      })
      test('then it should call paymentService.chargeWithUssd', () => {
        expect(paymentService.chargeWithUssd).toBeCalledWith(payload)
      })

      test('then is should return a charge request', () => {
        expect(response).toStrictEqual(null)
      })
    })
  })

  describe('verify', () => {
    describe('when verifying payment', () => {
      let payload: { txId: string, refId: string }
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          refId: '6789',
          txId: 'guyac78'
        }

        await paymentController.verifyPayment(payload, context)
      })
      test('then it should call paymentService.chargeWithUssd', () => {
        expect(paymentService.verifyPayment).toHaveBeenCalled()
      })
    })
  })
})
