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
    private readonly listingsClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async dashboardMetrics (): Promise<DashboardStatI> {
    const vendorMetric = await lastValueFrom<number>(
      this.vendorsClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_VENDOR_METRICS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )

    const userMetric = await lastValueFrom<number>(
      this.usersClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_USER_METRICS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )

    const orderMetric = await lastValueFrom<number>(
      this.ordersClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_ORDER_METRICS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )

    const listingMetric = await lastValueFrom<number>(
      this.listingsClient.send(QUEUE_MESSAGE.ADMIN_DASHBOARD_LISTING_METRICS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )

    return {
      overview: {
        totalOrders: orderMetric,
        totalUsers: userMetric,
        totalVendors: vendorMetric,
        totalListings: listingMetric,
        totalPayouts: 1, // To be replaced later
        totalRevenue: 1 // To be replaced later
      },
      vendors: 1, // To be replaced later
      orders: 1, // To be replaced later
      listings: 1 // To be replaced later
    }
  }
}
