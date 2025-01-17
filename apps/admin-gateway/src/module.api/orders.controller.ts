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
  Admin,
  AdminLevel,
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
import { AdminClearance } from './decorators/user-level.decorator'

@Controller('order')
@UseGuards(JwtAuthGuard)
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
  async getAllPaidOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient
        .send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_PAID_ORDERS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('fulfilled')
  async getAllFulfilledOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient
        .send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_FULFILLED_ORDERS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('transit')
  async getAllTransitOrders (): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient
        .send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_ALL_TRANSIT_ORDERS, {})
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('user/:id')
  async getAllUserOrder (@Param('id') userId: string): Promise<Order[]> {
    return await lastValueFrom(
      this.ordersClient
        .send<Order[]>(QUEUE_MESSAGE.ADMIN_GET_USER_ORDERS, { userId })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @Get('/:id')
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
  async updateOrderStatus (
    @AdminClearance([AdminLevel.OPERATIONS]) admin: Admin,
      @Body() data: UpdateOrderStatusRequestDto
  ): Promise<ResponseWithStatus> {
    const payload: UpdateOrderStatusRequestDto = {
      ...data,
      streamUpdates: true
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
