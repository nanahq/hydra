import { Controller } from '@nestjs/common'
import { DriversServiceService } from '../drivers-service.service'
import { ODSA } from './odsa.service'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException
} from '@nestjs/microservices'
import {
  Delivery,
  DeliveryI,
  OrderUpdateStream,
  QUEUE_MESSAGE,
  RmqService
} from '@app/common'

/**
 * Order Delivery Sorting and Assignation (ODSA) Service.
 * This handles delivery assignation and sorting for both pre and on-demand orders.
 */
@Controller()
export class OdsaController {
  constructor (
    private readonly driversService: DriversServiceService,
    private readonly odsa: ODSA,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_DELIVERIES)
  async getDeliveries (
    @Ctx() context: RmqContext
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsa.queryAllDeliveries()
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_DRIVER_FULFILLED_DELIVERIES)
  async getDriverFulfilledDeliveries (
    @Ctx() context: RmqContext,
      @Payload() { driverId }: { driverId: string }
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsa.queryFulfilledDeliveries(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.ADMIN_GET_DRIVER_PENDING_DELIVERIES)
  async getDriverPendingDeliveries (
    @Ctx() context: RmqContext,
      @Payload() { driverId }: { driverId: string }
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsa.queryPendingDeliveries(driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_ORDER_DELIVERY)
  async getOrderDelivery (
    @Ctx() context: RmqContext,
      @Payload() { orderId }: { orderId: string }
  ): Promise<DeliveryI | undefined> {
    try {
      return await this.odsa.queryOrderDelivery(orderId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @MessagePattern(QUEUE_MESSAGE.GET_VENDOR_DELIVERIES)
  async getVendorDeliveries (
    @Ctx() context: RmqContext,
      @Payload() { vendorId }: { vendorId: string }
  ): Promise<DeliveryI[] | undefined> {
    try {
      return await this.odsa.queryVendorDeliveries(vendorId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.STREAM_ORDER_UPDATES)
  async streamOrderUpdates (
    @Ctx() context: RmqContext,
      @Payload() data: OrderUpdateStream
  ): Promise<void> {
    try {
      this.odsa.streamOrderUpdatesViaSocket(data)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.ODSA_PROCESS_ORDER)
  async processIncomingOrder (
    @Payload() { orderId }: { orderId: string },
      @Ctx() context: RmqContext
  ): Promise<any> {
    try {
      return await this.odsa.handleProcessOrder(orderId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }

  @EventPattern(QUEUE_MESSAGE.ODSA_ASSIGN_INTERNAL_DRIVER)
  async assignInternalDriver (
    @Ctx() context: RmqContext,
      @Payload() { deliveryId, driverId }: {
        deliveryId: string
        driverId: string
      }
  ): Promise<any> {
    try {
      return await this.odsa.assignInternalDrivers(deliveryId, driverId)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
