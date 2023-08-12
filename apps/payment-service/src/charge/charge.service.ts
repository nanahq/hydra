import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  BankTransferAccountDetails,
  BankTransferRequest,
  BaseChargeRequest,
  FitRpcException,
  OrderI, OrderStatus,
  Payment,
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

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  constructor (
    private readonly paymentRepository: PaymentRepository,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    private readonly flutterwave: FlutterwaveService
  ) {}

  async chargeWithUssd (payload: UssdRequest): Promise<any> {
    try {
      // Fetch order information
      const orderQueryPayload: ServicePayload<{ orderId: string }> = {
        userId: payload.userId,
        data: { orderId: payload.orderId }
      }
      const order = await lastValueFrom<OrderI>(
        this.ordersClient.send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, orderQueryPayload).pipe(
          catchError((error) => {
            throw new RpcException(error)
          })
        )
      )

      this.logger.log(`[PIM] - Initiating a ussd charge for user_id: ${order.user._id} order_refId: ${order.refId}`)

      // Prepare charge payload
      const chargePayload: UssdCharge = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.totalOrderValue),
        email: order.user.email,
        currency: 'NGN',
        account_bank: payload.account_bank,
        account_number: payload.account_number
      }

      // Initiate charge and process response
      const response = await this.flutterwave.ussd(chargePayload)
      if (response.status === 'success') {
        await this.paymentRepository.create({
          refId: chargePayload.tx_ref,
          chargedAmount: chargePayload.amount,
          paymentId: response.data.id,
          type: 'USSD',
          user: order.user._id,
          order: order._id,
          status: 'PENDING'
        })

        this.logger.log(`[PIM] - Bank USSD charge initiated  for user_id: ${order.user._id} order_refId: ${order.refId}`)

        return {
          code: response?.meta?.authorization?.note
        }
      }
      throw new Error('Failed')
    } catch (e) {
      this.logger.error('[PIM] Failed to create ussd charge -', e)
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async chargeWithBankTransfer (payload: BankTransferRequest): Promise<BankTransferAccountDetails> {
    try {
      // Fetch order information
      const orderQueryPayload: ServicePayload<{ orderId: string }> = {
        userId: payload.userId,
        data: { orderId: payload.orderId }
      }
      const order = await lastValueFrom<OrderI>(
        this.ordersClient.send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, orderQueryPayload).pipe(
          catchError((error) => {
            throw new RpcException(error)
          })
        )
      )

      this.logger.log(`[PIM] - Initiating a bank transfer charge for user_id: ${order.user._id} order_refId: ${order.refId}`)

      // Prepare charge payload
      const chargePayload: BaseChargeRequest = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.totalOrderValue),
        email: order.user.email,
        currency: 'NGN'
      }

      // Initiate charge and process response
      const response = await this.flutterwave.bankTransfer(chargePayload)

      if (response.status === 'success') {
        await this.paymentRepository.create({
          refId: chargePayload.tx_ref,
          chargedAmount: chargePayload.amount,
          paymentId: response?.data?.id,
          type: 'BANK_TRANSFER',
          user: order.user._id,
          order: order._id,
          status: 'PENDING'
        })

        this.logger.log(`[PIM] - Bank transfer charge initiated  for user_id: ${order.user._id} order_refId: ${order.refId}`)
        return bankChargeMapper(response.meta.authorization)
      }
      throw new Error('Failed')
    } catch (e) {
      this.logger.log('[PIM] Failed to create bank transfer charged -', e)
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verifyPayment (txId: string, refId: string): Promise<void> {
    this.logger.log(`[PIM] - Verifying order payment ref: ${refId} txId: ${txId}`)
    try {
      const payment = await this.paymentRepository.findOne({ refId }) as Payment

      if (payment.status !== 'PENDING') {
        return
      }

      const checkIfPaymentIsCollected = await this.flutterwave.verify(String(txId))

      if (checkIfPaymentIsCollected?.data?.status !== 'successful' || Number(checkIfPaymentIsCollected?.data?.charged_amount) !== Number(payment.chargedAmount)) {
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

      this.logger.log(`[PIM] - Updating order status after payment order_id: ${payment.order}`)

      await lastValueFrom<any>(
        this.ordersClient.send(QUEUE_MESSAGE.UPDATE_ORDER_STATUS_PAID, payload).pipe(
          catchError((error) => {
            throw new RpcException(error)
          })
        )
      )

      await this.paymentRepository.update({ refId }, { status: 'SUCCESS' })
    } catch (error) {
      this.logger.error('[PIM] - Failed pending payment verification', error)
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

function bankChargeMapper (authorization: any): BankTransferAccountDetails {
  return {
    transfer_amount: authorization.transfer_amount,
    transfer_bank: authorization.transfer_bank,
    account_expiration: authorization.account_expiration,
    transfer_reference: authorization

      .transfer_reference,
    transfer_account: authorization.transfer_account
  }
}
