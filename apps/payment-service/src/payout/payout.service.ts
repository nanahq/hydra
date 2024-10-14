import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { VendorPayoutRepository } from './payout.repository'
import {
  FitRpcException,
  IRpcException, MultiPurposeServicePayload,
  Order,
  OrderI, OrderStatus,
  PayoutOverview,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus, SendPayoutEmail,
  VendorPayout,
  VendorPayoutServiceI
} from '@app/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { FilterQuery } from 'mongoose'
import * as moment from 'moment'
import { PaymentRepository } from '../charge/charge.repository'
import { arrayParser } from '@app/common/utils/statsResultParser'

@Injectable()
export class VendorPayoutService implements VendorPayoutServiceI {
  constructor (
    private readonly payoutRepository: VendorPayoutRepository,
    private readonly paymentRepository: PaymentRepository,
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

  async updatePayoutStatus (_id: string): Promise<ResponseWithStatus> {
    try {
      await this.payoutRepository.findOneAndUpdate({ _id }, { paid: true })
      const payout = await this.payoutRepository.findOneAndPopulate<any>({ _id }, ['vendor'])
      const payload: MultiPurposeServicePayload<SendPayoutEmail> = {
        id: '',
        data: {
          vendorName: payout.vendor.businessName,
          payoutDate: moment(payout.updatedAt).format('MMMM Do YYYY'),
          vendorId: payout.vendor._id.toString(),
          vendorBankDetails: 'Default Bank Account',
          vendorEmail: payout.vendor.email,
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          payoutAmount: `${payout.earnings}} Naira`
        }
      }
      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.SEND_PAYOUT_EMAILS, payload)
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update payout',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllPayout (): Promise<any> {
    return await this.payoutRepository.findAndPopulate({}, [
      'vendor',
      'orders'
    ])
  }

  async getVendorPayout (vendor: string): Promise<VendorPayout[]> {
    return await this.payoutRepository.findAndPopulate({ vendor }, ['orders'])
  }

  async payoutOverview (vendor: string): Promise<PayoutOverview> {
    const today = new Date()
    const _today = new Date(today.getTime())
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const todayStart = new Date(_today)
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date(_today)
    todayEnd.setHours(23, 59, 59, 999)
    const todaydayPayout = (await this.payoutRepository.find({
      createdAt: {
        $gte: todayStart.toISOString(),
        $lt: todayEnd.toISOString()
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

    const weekEarning = weekPayout.reduce((acc, obj) => {
      return acc + obj.earnings
    }, 0)

    const todayEarning = todaydayPayout.reduce((acc, obj) => {
      return acc + obj.earnings
    }, 0)

    return {
      '24_hours': todayEarning,
      '7_days': weekEarning,
      '30_days': monthEarning
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10PM, {
    timeZone: 'Africa/Lagos'
  })
  async handlePayoutComputation (): Promise<void> {
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
      orderStatus: OrderStatus.FULFILLED
    }
    const orders = await lastValueFrom<OrderI[]>(
      this.ordersClient.send(QUEUE_MESSAGE.GET_ALL_ORDERS, filter).pipe(
        catchError((error: IRpcException) => {
          throw new FitRpcException(error.message, error.status)
        })
      )
    )

    const ordersId = orders.map((order) => order._id)

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
        paid: false,
        orders: ordersId
      })
    }

    await this.payoutRepository.insertMany(payoutsToMake)
  }

  public async getPaymentMetrics (): Promise<{ sales: number, payouts: number }> {
    const aggregatePayoutsPromise: Promise<Array<{ id: any, payouts: number }>> = this.payoutRepository
      .findRaw()
      .aggregate([
        {
          $match: {
            paid: true
          }
        },
        {
          $group: {
            _id: null,
            payouts: { $sum: '$earnings' }
          }
        }
      ])

    const aggregateRevenuePromise: Promise<Array<{ id: any, sales: number }>> = this.paymentRepository
      .findRaw()
      .aggregate([
        {
          $match: {
            status: 'SUCCESS'
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$chargedAmount' }
          }
        }
      ])

    const [aggregateRevenue, aggregatePayouts] = await Promise.all([aggregateRevenuePromise, aggregatePayoutsPromise])
    return {
      sales: arrayParser<number>(aggregateRevenue, 'sales'),
      payouts: arrayParser<number>(aggregatePayouts, 'payouts')
    }
  }
}
