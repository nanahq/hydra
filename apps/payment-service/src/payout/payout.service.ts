import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { VendorPayoutRepository } from './payout.repository'
import { FitRpcException, IRpcException, Order, OrderI, QUEUE_MESSAGE, QUEUE_SERVICE, RandomGen, ResponseWithStatus, VendorPayout } from '@app/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { FilterQuery } from 'mongoose'

@Injectable()
export class VendorPayoutService {
  private readonly logger = new Logger(VendorPayoutService.name)
  constructor (
    private readonly payoutRepository: VendorPayoutRepository,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy
  ) {}

  async createPayout (data: Partial<VendorPayout>): Promise<ResponseWithStatus> {
    try {
      const payload = {
        ...data,
        refId: RandomGen.genRandomNum(10, 7)
      }

      await this.payoutRepository.create(payload)

      return { status: 1 }
    } catch (error) {
      throw new FitRpcException('Can not created payout at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updatePayoutStatus (refId: number): Promise<ResponseWithStatus> {
    try {
      await this.payoutRepository.findOneAndUpdate({ refId }, { paid: true })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException('Can not update payout', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllPayout (): Promise<any> {
    return await this.payoutRepository.findAndPopulate({}, 'vendor')
  }

  async getVendorPayout (vendor: string): Promise<VendorPayout[]> {
    return await this.payoutRepository.find({ vendor })
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Africa/Lagos'
  })
  async handlePayoutComputation (): Promise<void> {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const start = yesterday.setHours(0, 0, 0, 0)
    const end = yesterday.setHours(23, 59, 59, 999)

    const filter: FilterQuery<Order> = {
      createdAt: {
        $gte: start,
        $lt: end
      },
      orderStatus: 'DELIVERED_TO_CUSTOMER'
    }
    const orders = await lastValueFrom<OrderI[]>(
      this.ordersClient.send(QUEUE_MESSAGE.GET_ALL_ORDERS, filter)
        .pipe(
          catchError((error: IRpcException) => {
            throw new FitRpcException(error.message, error.status)
          })
        )
    )

    // Compute earnings for each vendor
    const vendorEarnings = new Map<string, number>()

    orders.forEach((order) => {
      const vendorId = order.vendor._id.toString()
      const earnings = vendorEarnings.get(vendorId) ?? 0
      vendorEarnings.set(vendorId, earnings + order.orderBreakDown.orderCost)
    })

    const payoutsToMake: Array<Partial<VendorPayout>> = []

    for (const [vendorId, earnings] of vendorEarnings) {
      payoutsToMake.push({
        refId: RandomGen.genRandomNum(10, 7),
        vendor: vendorId,
        earnings,
        paid: false
      })
    }

    await this.payoutRepository.insertMany(payoutsToMake)
  }
}
