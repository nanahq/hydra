import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  UseGuards
} from '@nestjs/common'
import {
  CurrentUser,
  IRpcException,
  Order,
  OrderI,
  PaystackChargeResponseData,
  PlaceOrderDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatusAndData,
  ServicePayload,
  User
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('order')
export class OrderController {
  constructor (
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly orderClient: ClientProxy
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createNewOrder (
    @Body() data: PlaceOrderDto,
      @CurrentUser() user: User
  ): Promise<
      ResponseWithStatusAndData<{
        order: OrderI
        paymentMeta: PaystackChargeResponseData
      }>
      > {
    const payload: ServicePayload<any> = {
      userId: user._id as any,
      data
    }
    return await lastValueFrom<
    ResponseWithStatusAndData<{
      order: OrderI
      paymentMeta: PaystackChargeResponseData
    }>
    >(
      this.orderClient.send(QUEUE_MESSAGE.CREATE_ORDER, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getAllOrders (@CurrentUser() user: User): Promise<any> {
    const payload: ServicePayload<null> = {
      userId: user._id as any,
      data: null
    }

    return await lastValueFrom<Order[]>(
      this.orderClient.send(QUEUE_MESSAGE.GET_USER_ORDERS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getOrderById (@Param('orderId') orderId: string): Promise<Order> {
    const payload: ServicePayload<{ orderId: string }> = {
      userId: '',
      data: { orderId }
    }

    return await lastValueFrom<Order>(
      this.orderClient.send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('ping')
  async ping (): Promise<string> {
    return 'Order Controller PONG'
  }
}
