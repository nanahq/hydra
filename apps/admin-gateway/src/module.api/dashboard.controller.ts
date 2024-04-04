import {
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'

import {
  Admin,
  DashboardStatI,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common'

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(Admin.name)

  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy,
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async dashboardMetrics (): Promise<DashboardStatI> {
    this.logger.log('[PIM] -> fetching dashboard stats')

    const [totalVendors, totalUsers, totalOrders, totalListings, paymentSummary] = await Promise.all([
      lastValueFrom<number>(
        this.vendorsClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_VENDOR_METRICS, {})
          .pipe(
            catchError<any, any>((error: IRpcException) => {
              throw new HttpException(error.message, error.status)
            })
          )
      ),

      lastValueFrom<number>(
        this.usersClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_USER_METRICS, {})
          .pipe(
            catchError<any, any>((error: IRpcException) => {
              throw new HttpException(error.message, error.status)
            })
          )
      ),

      lastValueFrom<number>(
        this.ordersClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_ORDER_METRICS, {})
          .pipe(
            catchError<any, any>((error: IRpcException) => {
              throw new HttpException(error.message, error.status)
            })
          )
      ),

      lastValueFrom<number>(
        this.listingsClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_LISTING_METRICS, {})
          .pipe(
            catchError<any, any>((error: IRpcException) => {
              throw new HttpException(error.message, error.status)
            })
          )
      ),
      lastValueFrom<{ sales: number, payouts: number }>(
        this.paymentClient.send<{ sales: number, payouts: number }>(QUEUE_MESSAGE.ADMIN_DASHBOARD_PAYMENT_METRICS, {})
          .pipe(
            catchError<any, any>((error: IRpcException) => {
              throw new HttpException(error.message, error.status)
            })
          )
      )

    ])
    return {
      overview: {
        totalOrders,
        totalUsers,
        totalVendors,
        totalListings,
        totalPayouts: paymentSummary.payouts,
        totalRevenue: paymentSummary.sales
      }
    }
  }
}
