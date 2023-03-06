import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Put,
  UseGuards
} from '@nestjs/common'
import {
  IRpcException,
  Order,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  UpdateOrderStatusRequestDto,
  Vendor
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('order')
export class OrdersController {
  constructor (
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy
  ) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders (@CurrentUser() vendor: Vendor): Promise<Order[]> {
    const payload: ServicePayload<null> = {
      userId: vendor._id as any,
      data: null
    }

    return await lastValueFrom<Order[]>(
      this.ordersClient.send(QUEUE_MESSAGE.GET_VENDORS_ORDERS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus (
    @Body() data: UpdateOrderStatusRequestDto
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateOrderStatusRequestDto> = {
      userId: '',
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.ordersClient.send(QUEUE_MESSAGE.UPDATE_ORDER_STATUS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder (@Param('id') orderId: string): Promise<Order> {
    const payload: ServicePayload<{ orderId: string }> = {
      userId: '',
      data: { orderId }
    }

    return await lastValueFrom<Order>(
      this.ordersClient
        .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
