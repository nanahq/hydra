import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  BankTransferAccountDetails, BankTransferCharge,
  BankTransferRequest,
  CreditChargeRequest,
  FitRpcException,
  OrderI,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
   ServicePayload
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

  async chargeWithCreditCard (payload: CreditChargeRequest): Promise<any> {
    return 'a'
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

      const chargePayload: BankTransferCharge = {
        tx_ref: `NANA-${RandomGen.genRandomNum()}`,
        amount: String(order.totalOrderValue),
        email: order.user.email,
        currency: 'NGN'
      }

      return await this.flutterwave.bankTransfer(chargePayload)
    } catch (e) {
      throw new FitRpcException('Can not place charge at this moment. Try again later', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
