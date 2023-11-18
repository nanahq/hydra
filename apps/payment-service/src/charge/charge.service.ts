import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import {
  BankTransferAccountDetails,
  BankTransferRequest,
  BaseChargeRequest,
  FitRpcException, nairaToKobo,
  OrderI,
  OrderStatus,
  Payment,
  PaymentServiceI, PaystackCharge,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ServicePayload,
  UpdateOrderStatusPaidRequestDto,
  UssdCharge,
  UssdRequest
} from '@app/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { PaymentRepository } from './charge.repository'
import { FlutterwaveService } from '../providers/flutterwave'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Promise } from 'mongoose'
import { PaystackService } from '../providers/paystack'

@Injectable()
export class PaymentService implements PaymentServiceI {
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
    private readonly flutterwave: FlutterwaveService,

    private readonly paystack: PaystackService
  ) {}

  async chargeWithUssd (payload: UssdRequest): Promise<{ code: string }> {
    try {
      // Fetch order information
      const orderQueryPayload: ServicePayload<{ orderId: string }> = {
        userId: payload.userId,
        data: { orderId: payload.orderId }
      }
      const order = await lastValueFrom<OrderI>(
        this.ordersClient
          .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, orderQueryPayload)
          .pipe(
            catchError((error) => {
              throw new RpcException(error)
            })
          )
      )

      const existingPayment = await this.paymentRepository.findOne({ order: order._id }) as Payment | null

      if (existingPayment !== null) {
        return JSON.parse(existingPayment.paymentMeta)
      }

      this.logger.log(
        `[PIM] - Initiating a ussd charge for user_id: ${order.user._id} order_refId: ${order.refId}`
      )

      // Prepare charge payload
      const chargePayload: UssdCharge = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.orderValuePayable),
        email: order.user.email,
        currency: 'NGN',
        account_bank: payload.account_bank,
        account_number: payload.account_number
      }

      // Initiate charge and process response
      const response = await this.flutterwave.ussd(chargePayload)

      const code = {
        code: response?.meta?.authorization?.note
      }
      if (response.status === 'success') {
        await this.paymentRepository.create({
          refId: chargePayload.tx_ref,
          chargedAmount: chargePayload.amount,
          paymentId: response.data.id,
          type: 'USSD',
          user: order.user._id,
          order: order._id,
          status: 'PENDING',
          paymentMeta: JSON.stringify(code)
        })

        this.logger.log(
          `[PIM] - Bank USSD charge initiated  for user_id: ${order.user._id} order_refId: ${order.refId}`
        )

        return code
      }
      throw new Error('Failed')
    } catch (e) {
      this.logger.error('[PIM] Failed to create ussd charge -', e)
      throw new FitRpcException(
        'Can not place charge at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async chargeWithBankTransfer (
    payload: BankTransferRequest
  ): Promise<BankTransferAccountDetails> {
    try {
      // Fetch order information
      const orderQueryPayload: ServicePayload<{ orderId: string }> = {
        userId: payload.userId,
        data: { orderId: payload.orderId }
      }
      const order = await lastValueFrom<OrderI>(
        this.ordersClient
          .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, orderQueryPayload)
          .pipe(
            catchError((error) => {
              throw new RpcException(error)
            })
          )
      )

      const existingPayment = await this.paymentRepository.findOne({ order: order._id }) as Payment | null

      if (existingPayment !== null) {
        return JSON.parse(existingPayment.paymentMeta)
      }

      this.logger.log(
        `[PIM] - Initiating a bank transfer charge for user_id: ${order.user._id} order_refId: ${order.refId}`
      )

      // Prepare charge payload
      const chargePayload: BaseChargeRequest = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.orderValuePayable),
        email: order.user.email,
        currency: 'NGN'
      }

      // Initiate charge and process response
      const response = await this.flutterwave.bankTransfer(chargePayload)

      const paymentMeta = bankChargeMapper(response.meta.authorization)
      if (response.status === 'success') {
        await this.paymentRepository.create({
          refId: chargePayload.tx_ref,
          chargedAmount: chargePayload.amount,
          paymentId: response?.data?.id,
          type: 'BANK_TRANSFER',
          user: order.user._id,
          order: order._id,
          status: 'PENDING',
          paymentMeta: JSON.stringify(paymentMeta)
        })

        this.logger.log(
          `[PIM] - Bank transfer charge initiated  for user_id: ${order.user._id} order_refId: ${order.refId}`
        )

        return paymentMeta
      }
      throw new Error('Failed')
    } catch (e) {
      this.logger.log('[PIM] Failed to create bank transfer charged -', e)
      throw new FitRpcException(
        'Can not place charge at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async initiateChargePaystack (req: PaystackCharge): Promise<any> {
    this.logger.log(`[PIM] - Initiating paystack charge for ${req.email}`)
    const payload = {
      ...req,
      amount: nairaToKobo(req.amount)
    }
    try {
      return await this.paystack.initiateCharge(payload)
    } catch (error) {
      this.logger.error(`Failed to initiate charge for ${req.email}`)
      throw new FitRpcException(
        'Can not place charge at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async verifyPayment (txId: string, refId: string): Promise<void> {
    this.logger.log(
      `[PIM] - Verifying order payment ref: ${refId} txId: ${txId}`
    )
    try {
      const payment = (await this.paymentRepository.findOne({
        refId
      })) as Payment

      if (payment.status !== 'PENDING') {
        return
      }

      const checkIfPaymentIsCollected = await this.flutterwave.verify(
        String(txId)
      )

      if (
        checkIfPaymentIsCollected?.data?.status !== 'successful' ||
        Number(checkIfPaymentIsCollected?.data?.charged_amount) !==
          Number(payment.chargedAmount)
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
          .send(QUEUE_MESSAGE.UPDATE_ORDER_STATUS_PAID, payload)
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
        'Can not place charge at this moment. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getPaymentInfo (payload: { userId: string, orderId: string }): Promise<Payment | null> {
    try {
      return await this.paymentRepository.findOne({ order: payload.orderId, user: payload.userId })
    } catch (error) {
      throw new FitRpcException('Something went wrong getting payment info', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllPaymentInfo (payload: { userId: string }): Promise<Payment[] | null> {
    try {
      return await this.paymentRepository.find({ user: payload.userId })
    } catch (error) {
      throw new FitRpcException('Something went wrong getting payment info', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    timeZone: 'Africa/Lagos'
  })
  async deleteUnpaidPayments (): Promise<void> {
    try {
      const date = new Date()
      const pastTenMinutes = new Date(date.getTime() - 10 * 60 * 1000)

      const payments = await this.paymentRepository.find({
        createdAt: {
          $lt: pastTenMinutes
        },
        status: 'PENDING'
      }) as Payment[] | null

      if (payments !== null && payments.length > 0) {
        const paymentIds = payments.map(({ _id }) => _id)

        await this.paymentRepository.deleteMany({
          _id: {
            $in: paymentIds
          }
        })

        this.logger.log(`[PIM] - Deleted ${payments.length} unpaid payments.`)
      }
    } catch (error) {
      this.logger.error('[PIM] - Failed to delete unpaid payments:', error)
      throw new FitRpcException(
        'Failed to delete unpaid payments. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}

function bankChargeMapper (authorization: any): BankTransferAccountDetails {
  return {
    transfer_amount: authorization.transfer_amount,
    transfer_bank: authorization.transfer_bank,
    account_expiration: authorization.account_expiration,
    transfer_reference: authorization.transfer_reference,
    transfer_account: authorization.transfer_account
  }
}
