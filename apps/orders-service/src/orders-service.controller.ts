import { Controller } from '@nestjs/common'
import { OrdersServiceService } from './orders-service.service'
import {
  MessagePattern,
  Payload,
  RpcException,
  Ctx,
  RmqContext
} from '@nestjs/microservices'
import {
  ResponseWithStatus,
  RmqService,
  ServicePayload,
  OrderDto,
  QUEUE_MESSAGE,
  OrderEntity,
  UpdateOrderStatusRequestDto
} from '@app/common'
@Controller('orders')
export class OrdersServiceController {
  constructor (
    private readonly ordersServiceService: OrdersServiceService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_ORDER)
  async placeOrder (
    @Payload() data: ServicePayload<OrderDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.ordersServiceService.placeOrder(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDORS_ORDERS)
  async getVendorsOrders (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<OrderEntity[]> {
    try {
      return await this.ordersServiceService.getVendorOrders(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_ORDER_STATUS)
  async updateOrderStatus (
    @Payload() { data }: ServicePayload<UpdateOrderStatusRequestDto>,
      @Ctx() context: RmqContext
  ): Promise<ResponseWithStatus> {
    try {
      return await this.ordersServiceService.updateStatus(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_USER_ORDERS)
  async getUsersOrders (
    @Payload() { userId }: ServicePayload<null>,
      @Ctx() context: RmqContext
  ): Promise<OrderEntity[]> {
    try {
      return await this.ordersServiceService.getUserOrders(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_REFNUM)
  async getOrderByRefNumber (
    @Payload() { data: { ref } }: ServicePayload<{ ref: number }>,
      @Ctx() context: RmqContext
  ): Promise<OrderEntity> {
    try {
      return await this.ordersServiceService.getOrderByRefId(ref)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID)
  async getOrderById (
    @Payload() { data: { orderId } }: ServicePayload<{ orderId: string }>,
      @Ctx() context: RmqContext
  ): Promise<OrderEntity> {
    try {
      return await this.ordersServiceService.getOrderById(orderId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_ORDERS)
  async getAllOrders (@Ctx() context: RmqContext): Promise<OrderEntity[]> {
    try {
      return await this.ordersServiceService.getAllOrderInDb()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
