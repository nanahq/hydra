import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import {
  FitRpcException,
  nairaToKobo,
  OrderInitiateCharge,
  OrderStatus,
  Payment,
  PaystackCharge,
  PaystackChargeResponseData,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ServicePayload,
  UpdateOrderStatusPaidRequestDto,
  PaystackService
} from '@app/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { PaymentRepository } from './charge.repository'

@Injectable()
export class PaymentService {
  private readonly logger = console

  constructor (
    private readonly paymentRepository: PaymentRepository,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly odsaClient: ClientProxy,
    private readonly paystack: PaystackService
  ) {}

  async initiateChargePaystack (
    req: OrderInitiateCharge
  ): Promise<PaystackChargeResponseData> {
    this.logger.log(
      `[PIM] - Initiating paystack charge for order ${req.orderId}`
    )

    const payload: PaystackCharge = {
      email: req.email,
      amount: nairaToKobo(req.amount),
      metadata: {
        transaction_ref: `NANA-${RandomGen.genRandomNum()}`
      }
    }

    try {
      const chargeMeta = await this.paystack.initiateCharge(payload)

      await this.paymentRepository.create({
        refId: chargeMeta.data.reference,
        chargedAmount: req.amount,
        paymentId: chargeMeta.data.access_code,
        type: 'PAYSTACK',
        user: req.userId,
        order: req.orderId,
        status: 'PENDING',
        paymentMeta: JSON.stringify(chargeMeta.data)
      })
      return chargeMeta.data
    } catch (error) {
      this.logger.error(`Failed to initiate charge for order ${req.orderId}`)
      this.logger.error(error)
      throw new FitRpcException(
        'Can not place charge at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async verifyPaymentPaystack (refId: string): Promise<void> {
    this.logger.log(`[PIM] - Verifying paystack order payment ref: ${refId}`)

    try {
      const payment = (await this.paymentRepository.findOne({
        refId
      })) as Payment

      if (payment.status !== 'PENDING') {
        return
      }

      this.logger.log('[PIM] - fetching payment verification')

      const verificationStatus = await this.paystack.verify(refId)

      this.logger.log(
        `[PIM] - fetched payment verification :${verificationStatus.data.status}`
      )

      if (
        verificationStatus.data.status.toLowerCase() !== 'success' ||
        verificationStatus.data.amount / 100 !== Number(payment.chargedAmount)
      ) {
        throw new Error('Payment not successful')
      }

      // Update order status
      const payload: ServicePayload<UpdateOrderStatusPaidRequestDto> = {
        userId: '',
        data: {
          status: OrderStatus.PROCESSED,
          orderId: payment.order,
          txRefId: payment.refId
        }
      }

      this.logger.log(
        `[PIM] - Updating order status after payment order_id: ${payment.order}`
      )

      await lastValueFrom<any>(
        this.ordersClient
          .emit(QUEUE_MESSAGE.UPDATE_ORDER_STATUS_PAID, payload)
          .pipe(
            catchError((error) => {
              throw new RpcException(error)
            })
          )
      )

      await this.paymentRepository.update({ refId }, { status: 'SUCCESS' })
    } catch (error) {
      this.logger.error('[PIM] - Failed pending payment verification', error)
      throw new FitRpcException(
        'Can not verify transaction at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getPaymentInfo (payload: {
    userId: string
    orderId: string
  }): Promise<Payment | null> {
    try {
      return await this.paymentRepository.findOne({
        order: payload.orderId,
        user: payload.userId
      })
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong getting payment info',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllPaymentInfo (payload: {
    userId: string
  }): Promise<Payment[] | null> {
    try {
      return await this.paymentRepository.find({ user: payload.userId })
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong getting payment info',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllUsersPayments (): Promise<Payment[] | null> {
    try {
      return await this.paymentRepository.findAndPopulate(
        {},
        ['user', 'order']
      )
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error('[PIM] -> Something went wrong getting all users payments')
      throw new FitRpcException(
        'Something went wrong fetching users payments.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
//
//   @Cron(CronExpression.EVERY_10_MINUTES, {
//     timeZone: 'Africa/Lagos'
//   })
//   async deleteUnpaidPayments (): Promise<void> {
//     try {
//       const date = new Date()
//       const pastTenMinutes = new Date(date.getTime() - 10 * 60 * 1000)
//
//       const payments = (await this.paymentRepository.find({
//         createdAt: {
//           $lt: pastTenMinutes.toISOString()
//         },
//         status: 'PENDING'
//       })) as Payment[] | null
//
//       if (payments !== null && payments.length > 0) {
//         const paymentIds = payments.map(({ _id }) => _id)
//
//         await this.paymentRepository.deleteMany({
//           _id: {
//             $in: paymentIds
//           }
//         })
//
//         this.logger.log(`[PIM] - Deleted ${payments.length} unpaid payments.`)
//       }
//     } catch (error) {
//       this.logger.error('[PIM] - Failed to delete unpaid payments:', error)
//       throw new FitRpcException(
//         'Failed to delete unpaid payments. Please try again later.',
//         HttpStatus.INTERNAL_SERVER_ERROR
//       )
//     }
//   }
}
