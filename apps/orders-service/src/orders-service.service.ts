import { HttpStatus, Inject, Injectable } from '@nestjs/common'

import {
  ExportPushNotificationClient,
  FitRpcException,
  Order,
  OrderI, OrderInitiateCharge,
  OrderStatus,
  OrderTypes, PaystackChargeResponseData,
  PlaceOrderDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  ServicePayload,
  UpdateOrderStatusPaidRequestDto,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { OrderRepository } from './order.repository'
import { Aggregate, FilterQuery } from 'mongoose'

@Injectable()
export class OrdersServiceService {
  private readonly logger = console

  constructor (
    private readonly orderRepository: OrderRepository,

    private readonly expoClient: ExportPushNotificationClient,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driverClient: ClientProxy,

    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  public async placeOrder ({
    data,
    userId
  }: ServicePayload<PlaceOrderDto>): Promise<ResponseWithStatusAndData<{ order: OrderI, paymentMeta: PaystackChargeResponseData }>> {
    const createOrderPayload: Partial<Order> = {
      ...data,
      user: userId,
      refId: RandomGen.genRandomNum(),
      orderStatus: OrderStatus.PAYMENT_PENDING
    }

    const _newOrder = await this.orderRepository.create(createOrderPayload)

    const populatedOrder: OrderI = await this.orderRepository.findOneAndPopulate({ _id: _newOrder._id }, ['listing', 'vendor', 'user'])

    if (_newOrder === null) {
      throw new FitRpcException(
        'Can not create your order at this time',
        HttpStatus.BAD_REQUEST
      )
    }

    const chargePayload: OrderInitiateCharge = {
      orderId: populatedOrder._id,
      email: populatedOrder.user.email,
      userId: populatedOrder.user._id,
      amount: String(populatedOrder.totalOrderValue)
    }
    const paymentMeta = await lastValueFrom<PaystackChargeResponseData>(this.paymentClient.send(QUEUE_MESSAGE.INITIATE_CHARGE_PAYSTACK, chargePayload))

    return { status: 1, data: { order: populatedOrder, paymentMeta } }
  }

  public async getAllVendorOrders (vendor: string): Promise<Order[]> {
    try {
      const _orders = (await this.orderRepository.findAndPopulate(
        { vendor },
        'listing vendor'
      )) as any
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllUserOrders (user: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate(
        { user },
        'user listing vendor'
      )
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllFulfilledOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.find({ orderStatus: OrderStatus.FULFILLED })
    } catch (e) {
      throw new FitRpcException('Failed to fetch all fulfilled orders something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getAllTransitOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.find({ orderStatus: OrderStatus.IN_ROUTE })
    } catch (e) {
      throw new FitRpcException('Failed to fetch all fulfilled orders something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getAllPaidOrder (): Promise<Order[]> {
    try {
      return await this.orderRepository.find({ orderStatus: OrderStatus.PROCESSED })
    } catch (e) {
      throw new FitRpcException('Failed to fetch all fulfilled orders something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getAllOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.find({ })
    } catch (e) {
      throw new FitRpcException('Failed to fetch all fulfilled orders something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getAllOrderInDb (
    filterQuery: FilterQuery<Order>
  ): Promise<Order[]> {
    try {
      console.log({ filterQuery })
      const _orders = (await this.orderRepository.findAndPopulate(
        filterQuery,
        'vendor'
      )) as any
      console.log({ _orders })
      return _orders
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getOrderByRefId (refId: number): Promise<Order | null> {
    try {
      return await this.orderRepository.findOneAndPopulate(
        { refId },
        'user listing vendor'
      )
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getOrderById (_id: string): Promise<Order | null> {
    try {
      this.logger.log(`PIM -> fetching single order with id: ${_id}`)
      return await this.orderRepository.findOneAndPopulate({ _id }, [
        'user',
        'listing',
        'vendor'
      ])
    } catch (error) {
      this.logger.error({
        error,
        message: 'failed to fetch order'
      })
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateStatus ({
    status,
    orderId
  }: UpdateOrderStatusRequestDto): Promise<ResponseWithStatus> {
    try {
      const order = await this.orderRepository.findOneAndPopulate({ _id: orderId }, ['vendor', 'listing', 'user']) as OrderI

      await this.orderRepository.findOneAndUpdate(
        { _id: orderId },
        { orderStatus: status }
      )

      this.logger.log(
        `[PIM] - order status updated for order: ${orderId} status: ${status}`
      )

      await this.sendPushNotifications(status, order)

      if (status === OrderStatus.FULFILLED) {
        await lastValueFrom<any>(
          this.notificationClient
            .emit(QUEUE_MESSAGE.ORDER_STATUS_UPDATE, {
              phoneNumber: order.primaryContact,
              status
            })
        )
      }
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'failed to updated order',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async updateStatusPaid ({
    status,
    orderId,
    txRefId
  }: UpdateOrderStatusPaidRequestDto): Promise<void> {
    try {
      this.logger.log(`[PIM] - Processing and updating paid order ${orderId} `)

      const order = await this.orderRepository.findOneAndPopulate({ _id: orderId }, ['vendor', 'listing', 'user']) as OrderI

      await this.orderRepository.findOneAndUpdate(
        { _id: orderId },
        {
          txRefId,
          orderStatus: status
        }
      )

      this.logger.log(
        `[PIM] - order status updated for paid order: ${orderId}`
      )

      await lastValueFrom<any>(
        this.notificationClient
          .emit(QUEUE_MESSAGE.PROCESS_PAID_ORDER, {
            phoneNumber: order.primaryContact,
            status
          })
      )

      await this.sendPushNotifications(status, order)

      await lastValueFrom(
        this.userClient.emit(QUEUE_MESSAGE.UPDATE_USER_ORDER_COUNT, {
          orderId: order._id,
          userId: order.user
        })
      )

      await lastValueFrom(
        this.listingsClient.emit(QUEUE_MESSAGE.UPDATE_SCHEDULED_LISTING_QUANTITY, {
          listingsId: order.listing.map(li => li._id),
          quantity: order.quantity
        })
      )

      if (order.orderType === OrderTypes.INSTANT) {
        // Start ODSA on instant order
        await lastValueFrom<any>(
          this.driverClient.emit(QUEUE_MESSAGE.ODSA_PROCESS_ORDER, { orderId })
        )
      }
    } catch (error) {
      this.logger.error(`[PIM] - Failed to process paid order ${orderId} `)
      throw new FitRpcException(
        'failed to process paid order',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async vendorAcceptOrder (
    orderId: string,
    phone: string
  ): Promise<void> {
    try {
      await this.orderRepository.findOneAndUpdate(
        { _id: orderId },
        { orderStatus: OrderStatus.ACCEPTED }
      )
      await lastValueFrom(
        this.notificationClient
          .emit(QUEUE_MESSAGE.VENDOR_ACCEPT_ORDER, { phone })
      )
    } catch (error) {
      throw new FitRpcException(
        'failed to process order',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async odsaGetPreOrders (): Promise<Order[] | null> {
    try {
      this.logger.log('PIM -> Getting pre orders for ODSA daily cron')
      return await this.orderRepository.findAndPopulate(
        {
          orderStatus: 'ORDER_PLACED',
          orderType: OrderTypes.PRE
        },
        ['listing', 'user', 'vendor']
      )
    } catch (error) {
      this.logger.error({
        message: 'PIM -> failed to get pre orders for ODSA daily cron',
        error
      })
      throw new FitRpcException(
        'failed to fetched ODSA pre orders',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async adminMetrics (): Promise<Aggregate<any>> {
    return await this.orderRepository.find({})
  }

  private async sendPushNotifications (status: OrderStatus, order: OrderI): Promise<void> {
    switch (status) {
      case OrderStatus.PROCESSED:
        await this.expoClient.sendSingleNotification(order.vendor.expoNotificationToken, {
          title: 'You have a new Order',
          body: `A new ${order.orderType === 'PRE_ORDER' ? 'Pre-order' : 'Instant order'}`,
          priority: 'high'
        })
        await this.expoClient.sendSingleNotification(order?.user?.expoNotificationToken as string, {
          title: 'Your order has been processed',
          body: 'Track the progress of your order on the mobile app',
          priority: 'high'
        })
        break
      case OrderStatus.IN_ROUTE:
        await this.expoClient.sendSingleNotification(order?.user?.expoNotificationToken as string, {
          title: 'Your order is been delivered',
          body: 'Our delivery person is on his way',
          priority: 'high'
        })
        break

      case OrderStatus.COURIER_PICKUP:
        await this.expoClient.sendSingleNotification(order?.user?.expoNotificationToken as string, {
          title: 'Your order has been prepared',
          body: `${order.vendor.businessName} has finished preparing your order`,
          priority: 'high'
        })
    }
  }
}
