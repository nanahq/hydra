import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import {
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  Delivery
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('delivery')
export class DeliveriesController {
  constructor (
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driversClient: ClientProxy
  ) {}

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getOrderDelivery (@Param('orderId') orderId: string): Promise<Delivery> {
    return await lastValueFrom<Delivery>(
      this.driversClient
        .send(QUEUE_MESSAGE.GET_ORDER_DELIVERY, { orderId })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('ping')
  async ping (): Promise<string> {
    return 'Delivery Controller PONG'
  }
}
