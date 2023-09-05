import { Controller, Get, HttpException, Inject, Logger, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'

import { Admin, IRpcException, QUEUE_MESSAGE, QUEUE_SERVICE, ResponseWithStatus } from '@app/common'

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(Admin.name)

  constructor (
    @Inject(QUEUE_SERVICE.ADMINS_SERVICE)
    private readonly adminClient: ClientProxy,
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly orderClient: ClientProxy
  ) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  async metrics (): Promise<ResponseWithStatus> {
    this.logger.debug('Dashboard - fetch metrics')
    return await lastValueFrom<ResponseWithStatus>(
      this.orderClient
        .send(QUEUE_MESSAGE.ADMIN_DASHBOARD_ORDER_METRICS, {})
        .pipe(
          catchError((error: IRpcException) => {
            console.log(error)
            this.logger.error(`Failed to fetch order aggregates. Reason: ${error.message}`)
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
