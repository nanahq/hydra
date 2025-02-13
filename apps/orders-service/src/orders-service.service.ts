import { HttpStatus, Inject, Injectable } from '@nestjs/common'

import {
  CustomerIoClient,
  ExportPushNotificationClient,
  FitRpcException,
  LastOrderPaymentStatus,
  MultiPurposeServicePayload,
  Order,
  OrderI,
  OrderInitiateCharge,
  OrderPaymentType,
  OrderStatI,
  OrderStatus,
  OrderTypes,
  OrderUpdateStream,
  PaystackChargeResponseData,
  PlaceOrderDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  RandomGen,
  ResponseWithStatus,
  ResponseWithStatusAndData,
  ServicePayload,
  UpdateCouponUsage,
  UpdateOrderStatusPaidRequestDto,
  UpdateOrderStatusRequestDto
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { OrderRepository } from './order.repository'
import { FilterQuery } from 'mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DebitUserWallet } from '@app/common/dto/General.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class OrdersServiceService {
  private readonly logger = console

  constructor (
    private readonly orderRepository: OrderRepository,

    private readonly expoClient: ExportPushNotificationClient,
    private readonly customerIoClient: CustomerIoClient,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driverClient: ClientProxy,

    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingsClient: ClientProxy,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,

    private readonly configService: ConfigService
  ) {}

  public async placeOrder ({
    data,
    userId
  }: ServicePayload<PlaceOrderDto>): Promise<
    ResponseWithStatusAndData<{
      order: OrderI
      paymentMeta: PaystackChargeResponseData
    }>
    > {
    const createOrderPayload: Partial<Order> = {
      ...data,
      user: userId,
      refId: RandomGen.genRandomNum(),
      orderStatus: OrderStatus.PAYMENT_PENDING,
      pin_code: RandomGen.genRandomNum(9, 4),
      ...(data.fleetOrderType === 'BOX' ? { itemDescription: data.itemDescription } : {})
    }

    const _newOrder = await this.orderRepository.create(createOrderPayload)

    const populatedOrder: OrderI =
      await this.orderRepository.findOneAndPopulate({ _id: _newOrder._id }, [
        'listing',
        'vendor',
        'user'
      ])

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
      amount: String(populatedOrder.orderValuePayable)
    }

    const deductBalancePayload: MultiPurposeServicePayload<DebitUserWallet> = {
      id: '',
      data: {
        user: populatedOrder.user._id.toString(),
        amountToDebit: populatedOrder.orderValuePayable
      }
    }
    let paymentMeta
    switch (data.paymentType) {
      case OrderPaymentType.PAY_ONLINE :
        paymentMeta = await lastValueFrom<PaystackChargeResponseData>(
          this.paymentClient.send(
            QUEUE_MESSAGE.INITIATE_CHARGE_PAYSTACK,
            chargePayload
          )
        )
        break
      case OrderPaymentType.PAY_BY_WALLET:
        paymentMeta = await lastValueFrom(this.paymentClient.send(
          QUEUE_MESSAGE.USER_WALLET_DEDUCT_BALANCE,
          deductBalancePayload
        ))
        if (paymentMeta.status === 1) {
          await this.updateStatusPaid({
            orderId: populatedOrder._id.toString(),
            status: OrderStatus.PROCESSED,
            txRefId: RandomGen.genRandomString()
          })
        }
        break
    }

    if (data.coupon !== undefined) {
      const updateCouponUsage: UpdateCouponUsage = {
        code: data.coupon,
        user: userId.toString()
      }
      await lastValueFrom(
        this.paymentClient.emit(
          QUEUE_MESSAGE.UPDATE_COUPON_USAGE,
          updateCouponUsage
        )
      )

      const payload: ServicePayload<{ couponCode: string }> = {
        userId,
        data: {
          couponCode: data.coupon
        }
      }
      await lastValueFrom(
        this.userClient.emit(QUEUE_MESSAGE.USER_REMOVE_COUPON, payload)
      )
    }

    return { status: 1, data: { order: populatedOrder, paymentMeta } }
  }

  public async getAllVendorOrders (vendor: string): Promise<Order[]> {
    try {
      return (await this.orderRepository.findAndPopulate({ vendor }, [
        'listing',
        'vendor'
      ])) as any
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllUserOrders (user: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({ user }, [
        'listing',
        'user',
        'vendor'
      ])
    } catch (error) {
      throw new FitRpcException(
        'Can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllFulfilledOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({
        orderStatus: OrderStatus.FULFILLED
      }, ['listing', 'user', 'vendor'])
    } catch (e) {
      throw new FitRpcException(
        'Failed to fetch all fulfilled orders something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllTransitOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({
        orderStatus: OrderStatus.IN_ROUTE
      }, ['listing', 'user', 'vendor'])
    } catch (e) {
      throw new FitRpcException(
        'Failed to fetch all fulfilled orders something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllPaidOrder (): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({
        orderStatus: OrderStatus.PROCESSED
      },
      ['listing', 'user', 'vendor'])
    } catch (e) {
      throw new FitRpcException(
        'Failed to fetch all fulfilled orders something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllOrders (): Promise<Order[]> {
    try {
      return await this.orderRepository.findAndPopulate({}, ['listing', 'user', 'vendor'])
    } catch (e) {
      throw new FitRpcException(
        'Failed to fetch all fulfilled orders something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getAllOrderInDb (
    filterQuery: FilterQuery<Order>
  ): Promise<Order[]> {
    try {
      const _orders = (await this.orderRepository.findAndPopulate(filterQuery, [
        'vendor'
      ])) as any
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
      return await this.orderRepository.findOneAndPopulate({ refId }, [
        'user',
        'listing',
        'vendor'
      ])
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
    orderId,
    streamUpdates
  }: UpdateOrderStatusRequestDto): Promise<ResponseWithStatus> {
    try {
      const order = await this.orderRepository.findOneAndPopulate<OrderI>(
        { _id: orderId },
        ['vendor', 'listing', 'user']
      )

      await this.orderRepository.findOneAndUpdate(
        { _id: orderId },
        { orderStatus: status }
      )

      this.logger.log(
        `[PIM] - order status updated for order: ${orderId} status: ${status}`
      )
      await this.sendPushNotifications(status, order)

      if (streamUpdates !== undefined && streamUpdates) {
        const updateStream: OrderUpdateStream = {
          userId: order.user._id.toString(),
          orderId: order._id.toString(),
          status,
          vendorName: order.vendor.businessName
        }
        await this.driverClient.emit(
          QUEUE_MESSAGE.STREAM_ORDER_UPDATES,
          updateStream
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

      const order = await this.orderRepository.findOneAndPopulate<OrderI>(
        { _id: orderId },
        ['vendor', 'listing', 'user']
      )

      let finalStatus: OrderStatus = status

      if (order?.vendor?._id?.toString() === this.configService.get('BOX_COURIER_VENDOR')) {
        finalStatus = OrderStatus.COURIER_PICKUP
      }

      await this.orderRepository.findOneAndUpdate(
        { _id: orderId },
        {
          txRefId,
          orderStatus: finalStatus
        }
      )

      this.logger.log(
        `[PIM] - order status updated for paid order: ${orderId}`
      )
      await this.sendPushNotifications(status, order)

      await lastValueFrom(
        this.userClient.emit(QUEUE_MESSAGE.UPDATE_USER_ORDER_COUNT, {
          orderId: order._id,
          userId: order.user
        })
      )

      await lastValueFrom(
        this.listingsClient.emit(
          QUEUE_MESSAGE.UPDATE_SCHEDULED_LISTING_QUANTITY,
          {
            listingsId: order.listing.map((li) => li._id),
            quantity: order.quantity
          }
        )
      )

      await lastValueFrom<any>(
        this.driverClient.emit(QUEUE_MESSAGE.ODSA_PROCESS_ORDER, { orderId })
      )
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
        this.notificationClient.emit(QUEUE_MESSAGE.VENDOR_ACCEPT_ORDER, {
          phone
        })
      )
    } catch (error) {
      throw new FitRpcException(
        'failed to process order',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getUserLastOrderStatus (user: string): Promise<LastOrderPaymentStatus> {
    const lastOrder: Order[] = await this.orderRepository.find({
      user,
      sort: { createdAt: -1 }
    })

    const mostRecentOrder = lastOrder[0]

    if (!mostRecentOrder || mostRecentOrder?.orderStatus !== OrderStatus.PROCESSED) {
      return { paid: false }
    }

    return { paid: true }
  }

  public async odsaGetPreOrders (
    filterQuery: FilterQuery<Order>
  ): Promise<Order[] | null> {
    try {
      this.logger.log('PIM -> Getting pre orders for ODSA daily cron')
      return await this.orderRepository.findAndPopulate(
        {
          ...filterQuery,
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

  async orderReview ({ data, id }: MultiPurposeServicePayload<{ reviewId: string }>): Promise<void> {
    try {
      await this.orderRepository.findOneAndUpdate(
        { _id: id },
        { review: data.reviewId })
    } catch (error) {

    }
  }

  async adminMetrics (): Promise<OrderStatI> {
    const today = new Date()
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(month)
    monthStart.setHours(0, 0, 0, 0)

    const [aggregateOrders, weeklyOrders, monthlyOrders] = await Promise.all([
      this.orderRepository.findRaw().countDocuments({}),

      this.orderRepository.findRaw().countDocuments({
        createdAt: {
          $gte: weekStart.toISOString(),
          $lt: today.toISOString()
        }
      }),

      this.orderRepository.findRaw().countDocuments({
        createdAt: {
          $gte: monthStart.toISOString(),
          $lt: today.toISOString()
        }
      })
    ])
    return {
      aggregateOrders,
      weeklyOrders,
      monthlyOrders
    }
  }

  // order_stauts_update_collected, order_status_update_in_route,order_status_update_delivered,order_status_update_placed
  private async sendPushNotifications (
    status: OrderStatus,
    order: OrderI
  ): Promise<void> {
    switch (status) {
      case OrderStatus.PROCESSED:
        await this.expoClient.sendSingleNotification(
          order.vendor.expoNotificationToken,
          {
            title: 'You have a new Order',
            body: `A new ${
              order.orderType === 'PRE_ORDER' ? 'Pre-order' : 'Instant order'
            }`,
            priority: 'high'
          }
        )
        await this.customerIoClient.sendPushNotification(order.user._id.toString(), 'order_status_update_placed')
        break
      case OrderStatus.IN_ROUTE:
        await this.customerIoClient.sendPushNotification(order.user._id.toString(), 'order_status_update_in_route')
        break
      case OrderStatus.COURIER_PICKUP:
        await this.customerIoClient.sendPushNotification(order.user._id.toString(), 'order_stauts_update_collected')
        break
      case OrderStatus.FULFILLED:
        await this.customerIoClient.sendPushNotification(order.user._id.toString(), 'order_status_update_delivered')
        break
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, {
    timeZone: 'Africa/Lagos'
  })
  async deleteUnpaidPayments (): Promise<void> {
    try {
      const date = new Date()
      const pastTenMinutes = new Date(date.getTime() - 10 * 60 * 1000)

      const filter: FilterQuery<Order> = {
        createdAt: {
          $lte: pastTenMinutes.toISOString()
        },
        orderStatus: OrderStatus.PAYMENT_PENDING
      }

      const orders: Order[] = await this.orderRepository.find(filter)

      if (orders !== null && orders.length > 0) {
        const orderIds = orders.map(({ _id }) => _id)

        await this.orderRepository.deleteMany({
          _id: {
            $in: orderIds
          }
        })

        this.logger.log(`[PIM] - Deleted ${orderIds.length} unpaid orders.`)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async ping (): Promise<string> {
    return 'PONG'
  }
}
