import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { VendorPayoutRepository } from './payout.repository'
import {
  FitRpcException,
  IRpcException,
  Order,
  OrderI,
  PayoutOverview,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus,
  SendPayoutEmail,
  VendorPayout, VendorPayoutServiceI
} from '@app/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { FilterQuery } from 'mongoose'

@Injectable()
export class VendorPayoutService implements VendorPayoutServiceI {
  private readonly logger = new Logger(VendorPayoutService.name)
  constructor (
    private readonly payoutRepository: VendorPayoutRepository,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
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
      throw new FitRpcException(
        'Can not created payout at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updatePayoutStatus (refId: number): Promise<ResponseWithStatus> {
    try {
      await this.payoutRepository.findOneAndUpdate({ refId }, { paid: true })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update payout',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllPayout (): Promise<any> {
    return await this.payoutRepository.findAndPopulate({}, 'vendor')
  }

  async getVendorPayout (vendor: string): Promise<VendorPayout[]> {
    return await this.payoutRepository.find({ vendor })
  }

  async payoutOverview (vendor: string): Promise<PayoutOverview> {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const yesterdayStart = new Date(yesterday)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)
    const yesterdayPayout = (await this.payoutRepository.find({
      createdAt: {
        $gte: yesterdayStart.toISOString(),
        $lt: yesterdayEnd.toISOString()
      },
      vendor
    })) as VendorPayout[]

    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)

    const weekPayout = (await this.payoutRepository.find({
      createdAt: {
        $gte: weekStart.toISOString(),
        $lt: today.toISOString()
      },
      vendor
    })) as VendorPayout[]

    const monthStart = new Date(month)
    monthStart.setHours(0, 0, 0, 0)
    const monthPayout = (await this.payoutRepository.find({
      createdAt: {
        $gte: monthStart.toISOString(),
        $lt: today.toISOString()
      },
      vendor
    })) as VendorPayout[]

    const monthEarning = monthPayout.reduce((acc, obj) => {
      return acc + obj.earnings
    }, 0)

    const yesterdayEarning = yesterdayPayout.reduce((acc, obj) => {
      return acc + obj.earnings
    }, 0)

    const weekEarning = weekPayout.reduce((acc, obj) => {
      return acc + obj.earnings
    }, 0)
    return {
      '24_hours': yesterdayEarning,
      '7_days': weekEarning,
      '30_days': monthEarning
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'Africa/Lagos'
  })
  async handlePayoutComputation (): Promise<void> {
    console.log('running payout cron')

    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const start = new Date(yesterday)
    start.setHours(0, 0, 0, 0)

    const end = new Date(yesterday)
    end.setHours(23, 59, 59, 999)

    const filter: FilterQuery<Order> = {
      createdAt: {
        $gte: start.toISOString(),
        $lt: end.toISOString()
      },
      orderStatus: 'DELIVERED_TO_CUSTOMER'
    }
    const orders = await lastValueFrom<OrderI[]>(
      this.ordersClient.send(QUEUE_MESSAGE.GET_ALL_ORDERS, filter).pipe(
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
      vendorEarnings.set(
        vendorId,
        earnings + Number(order.orderBreakDown.orderCost)
      )
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

  @Cron(CronExpression.EVERY_DAY_AT_NOON, {
    timeZone: 'Africa/Lagos'
  })
  async sendPayoutEmails (): Promise<void> {
    const today = new Date()
    const start = new Date(today)
    start.setHours(0, 0, 0, 0)

    const end = new Date(today)
    end.setHours(23, 59, 59, 999)

    const filter: FilterQuery<VendorPayout> = {
      createdAt: {
        $gte: start.toISOString(),
        $lt: end.toISOString()
      },
      paid: true
    }

    const todayPayouts = (await this.payoutRepository.findAndPopulate(
      filter,
      'vendor'
    )) as any

    if (todayPayouts.length < 1) {
      return
    }

    const transactionalEmailPayload = payoutMapper(todayPayouts)

    await lastValueFrom(
      this.notificationClient
        .emit(QUEUE_MESSAGE.SEND_PAYOUT_EMAILS, transactionalEmailPayload)
        .pipe(
          catchError((error) => {
            throw new RpcException(error)
          })
        )
    )
  }
}

function payoutMapper (payouts: any[]): SendPayoutEmail[] {
  return payouts.map((payout) => ({
    payoutAmount: payout.earnings,
    payoutDate: payout.createdAt,
    vendorId: payout.vendor._id,
    vendorEmail: payout.vendor.businessEmail,
    vendorName: payout.vendor.businessName
  }))
}
