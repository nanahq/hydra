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
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import {
  IRpcException,
  Order,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('order')
export class OrdersController {
  constructor (
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy
  ) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getAllOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient.send(QUEUE_MESSAGE.ADMIN_GET_ALL_ORDERS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('paid')
  @UseGuards(JwtAuthGuard)
  async getAllPaidOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient.send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_PAID_ORDERS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('fulfilled')
  @UseGuards(JwtAuthGuard)
  async getAllFulfilledOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient.send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_FULFILLED_ORDERS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('transit')
  @UseGuards(JwtAuthGuard)
  async getAllTransitOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient.send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_TRANSIT_ORDERS, {}).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getAllUserOrder (
    @Param('id') userId: string
  ): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient.send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_USER_ORDERS, {userId}).pipe(
        catchError<any, any>((error: IRpcException) => {
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
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Put('status')
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
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
