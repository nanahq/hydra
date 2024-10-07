import { Controller } from '@nestjs/common'
import { OrdersServiceService } from './orders-service.service'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import {
  MultiPurposeServicePayload,
  Order,
  OrderI,
  PaystackChargeResponseData,
  PlaceOrderDto,
  QUEUE_MESSAGE,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  RmqService,
  ServicePayload,
  UpdateOrderStatusPaidRequestDto,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { FilterQuery } from 'mongoose'

@Controller('order')
export class OrdersServiceController {
  constructor (
    private readonly ordersServiceService: OrdersServiceService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.CREATE_ORDER)
  async placeOrder (
    @Payload() data: ServicePayload<PlaceOrderDto>,
      @Ctx() context: RmqContext
  ): Promise<
      ResponseWithStatusAndData<{
        order: OrderI
        paymentMeta: PaystackChargeResponseData
      }>
      > {
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
  ): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllVendorOrders(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.UPDATE_ORDER_STATUS)
  async updateOrderStatus (
    @Payload() data: UpdateOrderStatusRequestDto,
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
  ): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllUserOrders(userId)
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
  ): Promise<Order | null> {
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
  ): Promise<Order | null> {
    try {
      return await this.ordersServiceService.getOrderById(orderId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ALL_ORDERS)
  async getAllOrders (
    @Payload() filterQuery: FilterQuery<Order>,
      @Ctx() context: RmqContext
  ): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllOrderInDb(filterQuery)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.VENDOR_ACCEPT_ORDER)
  async vendorAcceptOrder (
    @Payload() data: { orderId: string, phone: string },
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.ordersServiceService.vendorAcceptOrder(
        data.orderId,
        data.phone
      )
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ODSA_GET_ORDERS_PRE)
  async getOdsaPreOrders (
    @Payload() { filter }: { filter: FilterQuery<Order> },
      @Ctx() context: RmqContext
  ): Promise<Order[] | null> {
    try {
      return await this.ordersServiceService.odsaGetPreOrders(filter)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_DASHBOARD_ORDER_METRICS)
  async adminAggregates (@Ctx() context: RmqContext): Promise<any> {
    try {
      return await this.ordersServiceService.adminMetrics()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_ALL_ORDERS)
  async getOrders (@Ctx() context: RmqContext): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllOrders()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_ALL_PAID_ORDERS)
  async getPaidOrders (@Ctx() context: RmqContext): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllPaidOrder()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_ALL_TRANSIT_ORDERS)
  async getAllTransitOrders (@Ctx() context: RmqContext): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllTransitOrders()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_ALL_FULFILLED_ORDERS)
  async getAllFulfilledOrders (@Ctx() context: RmqContext): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllFulfilledOrders()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_USER_ORDERS)
  async getAllUserOrders (
    @Payload() { userId }: { userId: string },
      @Ctx() context: RmqContext
  ): Promise<Order[]> {
    try {
      return await this.ordersServiceService.getAllUserOrders(userId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.UPDATE_ORDER_STATUS_PAID)
  async updateOrderStatusWhenPaid (
    @Payload() { data }: ServicePayload<UpdateOrderStatusPaidRequestDto>,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.ordersServiceService.updateStatusPaid(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.UPDATE_ORDER_REVIEW)
  async addOrderReview (
    @Payload() payload: MultiPurposeServicePayload<{ reviewId: string }>,
      @Ctx() context: RmqContext
  ): Promise<void> {
    try {
      return await this.ordersServiceService.orderReview(payload)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ORDER_SERVICE_REQUEST_PING)
  async ping (
    @Ctx() context: RmqContext
  ): Promise<string | undefined> {
    try {
      return await this.ordersServiceService.ping()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
