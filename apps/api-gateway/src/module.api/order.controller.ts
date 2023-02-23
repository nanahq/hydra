import {
  Controller,
  Inject,
  Post,
  Get,
  Body,
  UseGuards,
  HttpException,
  Param,
} from '@nestjs/common';
import {
  OrderDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  IRpcException,
  ServicePayload,
  UserEntity,
  OrderEntity,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createNewOrder(
    @Body() data: OrderDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<any> = {
      userId: user.id,
      data,
    };
    return await lastValueFrom<ResponseWithStatus>(
      this.orderClient.send(QUEUE_MESSAGE.CREATE_ORDER, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @Get('get-order/:id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Param('id') orderId: string): Promise<OrderEntity> {
    const payload: ServicePayload<{ orderId: string }> = {
      userId: '',
      data: { orderId },
    };

    return await lastValueFrom<OrderEntity>(
      this.orderClient.send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @Get('get-all')
  @UseGuards(JwtAuthGuard)
  async getAllOrders(@CurrentUser() user: UserEntity): Promise<OrderEntity[]> {
    const payload: ServicePayload<null> = {
      userId: user.id,
      data: null,
    };
    return await lastValueFrom<OrderEntity[]>(
      this.orderClient.send(QUEUE_MESSAGE.GET_USER_ORDERS, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }
}
