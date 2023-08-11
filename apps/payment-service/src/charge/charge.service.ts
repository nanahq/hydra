import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  BankTransferAccountDetails,
  BaseChargeRequest,
  BankTransferRequest,
  FitRpcException,
  OrderI,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ServicePayload, UssdRequest, UssdCharge
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

      const chargePayload: UssdCharge = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.totalOrderValue),
        email: order.user.email,
        currency: 'NGN',
        account_bank: payload.account_bank,
        account_number: payload.account_number
      }
      const response  = await this.flutterwave.ussd(chargePayload)

      if(response.status === 'success') {
        return   {
          code: response?.meta?.authorization?.note
        }
      } else {
        throw new Error('Failed')
      }

    } catch (e) {
      this.logger.error('[PIM] Failed to create ussd charge -', e)
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async chargeWithBankTransfer (payload: BankTransferRequest): Promise<BankTransferAccountDetails> {
    try {
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

      const chargePayload: BaseChargeRequest = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.totalOrderValue),
        email: order.user.email,
        currency: 'NGN'
      }
      const response  = await this.flutterwave.bankTransfer(chargePayload)

      if(response.status === 'success') {
        return   bankchargeMapper(response.meta.authorization)
      } else {
        throw new Error('Failed')
      }

    } catch (e) {
      this.logger.log('[PIM] Failed to create bank transfer charged -', e)
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}


function bankchargeMapper ( authorization : any): BankTransferAccountDetails {
  return {
    transfer_amount: authorization.transfer_amount,
    transfer_bank: authorization.transfer_bank,
    account_expiration: authorization.account_expiration,
    transfer_reference: authorization.transfer_reference,
    transfer_account: authorization.transfer_account
  }
}
