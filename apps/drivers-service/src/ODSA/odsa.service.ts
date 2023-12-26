import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import {
  Delivery,
  DeliveryI,
  Driver, DriverStatGroup, DriverStats,
  DriverWithLocation,
  FitRpcException,
  Order,
  OrderI,
  OrderStatus, OrderUpdateStream,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus, SOCKET_MESSAGE, TravelDistanceResult,
  VendorApprovalStatus
} from '@app/common'
import { groupOrdersByDeliveryTime } from './algo/groupOrdersByDeliveryTime'
import { DriverRepository } from '../drivers-service.repository'
import { OdsaRepository } from './odsa.repository'
import * as moment from 'moment'
import { FilterQuery } from 'mongoose'
import { EventsGateway } from '../websockets/events.gateway'

@Injectable()
export class ODSA {
  private readonly logger = new Logger(ODSA.name)
  private readonly MAX_ORDER_EXPIRY = 2
  constructor (
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly orderClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LOCATION_SERVICE)
    private readonly locationClient: ClientProxy,
    private readonly driversRepository: DriverRepository,
    private readonly odsaRepository: OdsaRepository,

    //   Websocket gateway injection for order status updates
    private readonly eventsGateway: EventsGateway
  ) {}

  public async queryPendingDeliveries (
    driverId: string
  ): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null =
        await this.odsaRepository.findAndPopulate({ driver: driverId.toString(), status: { $ne: OrderStatus.FULFILLED } }, [
          'listing',
          'vendor',
          'user',
          'order'
        ])
      return deliveries
    } catch (error) {
      this.logger.error(
        `PIM -> Failed to query pending deliveries for driver ${driverId}`
      )
      this.logger.error(JSON.stringify(error))
    }
  }

  public async queryOrderDelivery (orderId: string): Promise<DeliveryI | undefined> {
    try {
      return (await this.odsaRepository.findOneAndPopulate({ order: orderId }, [
        'order',
        'driver',
        'listing'
      ])) as DeliveryI
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryDayDeliveries (driverId: string): Promise<DeliveryI[] | undefined> {
    const today = new Date()

    this.logger.log(`PIM -> Getting today's delivery ${today.toISOString()}`)

    const start = new Date(today)
    start.setHours(0, 0, 0, 0)

    const end = new Date(today)
    end.setHours(23, 59, 59, 999)

    const filters: FilterQuery<Delivery> = {
      driver: driverId.toString(),
      deliveryType: 'PRE_ORDER',
      deliveryTime: {
        $gte: start.toISOString(),
        $lte: end.toISOString()
      }
    }

    try {
      return (await this.odsaRepository.findAndPopulate(filters, [
        'order',
        'driver',
        'listing'
      ]))
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryVendorDeliveries (vendor: string): Promise<DeliveryI[] | undefined> {
    try {
      return (await this.odsaRepository.findAndPopulate({ vendor }, [
        'listing',
        'order',
        'driver'
      ]))
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryAllDeliveries (
  ): Promise<Delivery[] | undefined> {
    try {
      return await this.odsaRepository.findAndPopulate({}, [
        'listing',
        'vendor',
        'user',
        'order'
      ])
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryFulfilledDeliveries (
    driverId: string
  ): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null =
        await this.odsaRepository.findAndPopulate({ driver: driverId.toString() }, [
          'listing',
          'vendor',
          'user',
          'order'
        ])

      return deliveries
    } catch (error) {
      this.logger.error({
        message: `PIM -> Failed to query pending deliveries for driver ${driverId}`,
        error
      })
    }
  }

  public async handleUpdateDeliveryStatus (data: {
    status: OrderStatus
    driverId: string
    deliveryId: string
  }): Promise<ResponseWithStatus> {
    try {
      this.logger.log('PIM -> Updating delivery status')

      const delivery = await this.odsaRepository.findOneAndPopulate({
        _id: data.deliveryId
      }, ['order', 'vendor', 'user']) as DeliveryI

      await lastValueFrom(
        this.orderClient.send(QUEUE_MESSAGE.UPDATE_ORDER_STATUS, {
          orderId: delivery.order,
          status: data.status
        })
      )

      const updates: Partial<Delivery> = { status: data.status }

      // Check if it is a pickup update
      const pickedUp = data.status === OrderStatus.COLLECTED

      if (pickedUp) {
        const deliveryTime = new Date()
        const travelDistance = await lastValueFrom<TravelDistanceResult>(
          this.locationClient.send(QUEUE_MESSAGE.LOCATION_GET_ETA, { vendorCoords: delivery.pickupLocation.coordinates, userCoords: delivery.dropOffLocation.coordinates })
        )

        deliveryTime.setMinutes(deliveryTime.getMinutes() + (travelDistance.duration ?? 20))
        updates.deliveryTime = moment(deliveryTime).toISOString()
        updates.travelMeta = {
          distance: travelDistance?.distance ?? 0,
          travelTime: travelDistance?.duration ?? 0
        }
      }

      const delivered = data.status === OrderStatus.FULFILLED

      let deliveredWithinTime: boolean = false

      if (delivered) {
        deliveredWithinTime = moment().isSameOrBefore(new Date(delivery.deliveryTime))
        updates.deliveredWithinTime = deliveredWithinTime
        updates.completed = true
      }

      await this.odsaRepository.findOneAndUpdate(
        { _id: delivery._id },
        updates
      )

      if (delivered) {
        const driver = await this.driversRepository.findOne({ _id: delivery.driver, type: 'DELIVER_ON_DEMAND' }) as Driver

        const deliveries = [...driver.deliveries, delivery._id]
        const totalTrips = driver.totalTrips + 1

        await this.driversRepository.findOneAndUpdate({ _id: driver._id }, { available: true, deliveries, totalTrips })
      }

      this.logger.log('PIM -> Success: Updated delivery status')

      const streamPayload: OrderUpdateStream = {
        userId: delivery.user._id,
        orderId: delivery.order._id,
        status: data.status

      }

      // Emit socket event -> Order Status update
      this.streamOrderUpdatesViaSocket(streamPayload.orderId, streamPayload.userId, streamPayload.status)

      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error(`Failed to update delivery status for id: ${data.deliveryId}`)
      throw new FitRpcException(
        'Failed to update delivery status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async handleProcessOrder (
    _order: Order | string,
    existingDeliver?: boolean,
    deliveryId?: string
  ): Promise<void> {
    this.logger.log(`PIM -> started processing instant order: ${typeof _order !== 'string' ? _order?._id.toString() : _order}`)
    try {
      if ((existingDeliver === true) && typeof _order !== 'string') {
        const createdAt = moment(_order.createdAt)
        const currentTime = moment()
        const timeDiff = currentTime.diff(createdAt, 'hours')

        // TODO(@siradji) update order status to 'UNDELIVERABLE' and send email to user.
        if (timeDiff > this.MAX_ORDER_EXPIRY) {
          await this.odsaRepository.delete(deliveryId as any)
          this.logger.log('[FORWARD_ADMIN]: Order has exceeded 2 hours')
          return
        }
      }

      const order = await lastValueFrom<OrderI>(
        this.orderClient
          .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, {
            userId: '',
            data: { orderId: typeof _order !== 'string' ? _order?._id.toString() : _order }
          })
          .pipe(
            catchError((error) => {
              this.logger.error(JSON.stringify(error))
              throw new RpcException(error)
            })
          )
      )

      const collectionLocation = order?.vendor?.location?.coordinates as [number, number] // address for the vendor/restaurant
      const driverToBeAssigned = await this.handleFindNearestDeliveryDriver(
        collectionLocation
      )

      if (driverToBeAssigned === null) {
        if (existingDeliver === undefined) {
          await this.odsaRepository.create({
            listing: order.listing.map(li => li._id),
            order: order._id,
            vendor: order.vendor?._id,
            user: order.user._id,
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location,
            assignedToDriver: false,
            status: OrderStatus.PROCESSED,
            deliveryType: 'ON_DEMAND'
          })
        }
        return
      }

      if (existingDeliver !== undefined && existingDeliver) {
        await this.odsaRepository.findOneAndUpdate(
          { order: typeof _order !== 'string' ? _order?._id.toString() : _order },
          {
            driver: driverToBeAssigned?.driverId,
            assignedToDriver: true
          }
        )
      } else {
        await this.odsaRepository.create({
          driver: driverToBeAssigned?.driverId,
          listing: order.listing.map(li => li._id),
          order: order._id,
          vendor: order.vendor?._id,
          user: order.user._id,
          dropOffLocation: order.preciseLocation,
          pickupLocation: order.vendor.location,
          assignedToDriver: true,
          status: OrderStatus.PROCESSED,
          deliveryType: 'ON_DEMAND'
        })
      }
      await this.driversRepository.findOneAndUpdate(
        { _id: driverToBeAssigned?.driverId },
        { available: false }
      )
    } catch (error) {
      this.logger.error(
        `Something went wrong processing order ${typeof _order !== 'string' ? _order?._id.toString() : _order}`
      )
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not process order right now',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    timeZone: 'Africa/Lagos'
  })
  private async assignDemandOrders (): Promise<void> {
    const unassignedDeliveries = await this.odsaRepository.findAndPopulate({
      assignedToDriver: false,
      deliveryType: 'ON_DEMAND'
    }, ['order']) as any

    try {
      for (const delivery of unassignedDeliveries) {
        await this.handleProcessOrder(delivery.order, true, delivery._id)
      }
    } catch (error) {
      this.logger.error('failed to assign orders')
      this.logger.error(JSON.stringify(error))
    }
  }

  /**
   * Odsa Cron for pre-order. Runs daily @ 6AM WAT to assign orders to drivers
   * @private
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'Africa/Lagos'
  })
  private async sortAndAssignPreOrders (): Promise<void> {
    const today = new Date()

    this.logger.log(`PIM -> sorting and processing pre orders for ${today.toISOString()}`)

    const start = new Date(today)
    start.setHours(0, 0, 0, 0)

    const end = new Date(today)
    end.setHours(23, 59, 59, 999)

    const filter: FilterQuery<Order> = {
      orderDeliveryScheduledTime: {
        $gte: start.toISOString(),
        $lt: end.toISOString()
      }
    }
    const orders = await lastValueFrom<OrderI[]>(
      this.orderClient.send(QUEUE_MESSAGE.ODSA_GET_ORDERS_PRE, { filter }).pipe(
        catchError((error) => {
          throw new RpcException(error)
        })
      )
    )

    if (orders.length < 1) {
      return
    }

    const drivers = await this.driversRepository.find({
      // isValidated: true,
      type: 'DELIVER_PRE_ORDER',
      acc_status: VendorApprovalStatus.APPROVED,
      available: true
    })

    const ordersForToday = filterOrdersForDay(orders)

    this.logger.log(
      `PIM -> Found ${ordersForToday.length} orders scheduled for delivery today`
    )

    const groupedOrders = groupOrdersByDeliveryTime(
      orders,
      drivers !== null ? drivers?.length : 0
    )

    this.logger.log(
      `PIM -> Grouped ${ordersForToday.length} orders scheduled for delivery today`
    )

    await this.assignPreOrdersDelivery(groupedOrders, drivers)
  }

  private async assignPreOrdersDelivery (
    groupedOrders: any[],
    drivers: any[]
  ): Promise<void> {
    if (drivers?.length <= 0 || groupedOrders?.length <= 0) {
      return
    }

    this.logger.log(
      `PIM -> Assigning ${groupedOrders.length} grouped orders to ${drivers.length}`
    )
    const newDeliveries: Array<Partial<Delivery>> = []
    groupedOrders.forEach((group) => {
      group.orders.forEach((order) => {
        drivers.forEach((driver) => {
          newDeliveries.push({
            listing: order.listing.map(li => li._id),
            order: order._id,
            vendor: order.vendor._id,
            user: order.user._id,
            driver: driver._id,
            deliveryTime: order.orderDeliveryScheduledTime,
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location,
            assignedToDriver: true,
            deliveryType: 'PRE_ORDER'
          })
        })
      })
    })

    const driverIds = drivers.map(driver => driver._id)

    await this.odsaRepository.insertMany(newDeliveries)

    await this.driversRepository.findAndUpdate({ _id: { $in: driverIds } }, { available: false })

    this.logger.log(
      `PIM -> Success: Assigned ${groupedOrders.length} grouped orders to ${drivers.length} drivers`
    )
  }

  private async handleFindNearestDeliveryDriver (
    targetCoord: number[]
  ): Promise<DriverWithLocation | null> {
    this.logger.log('PIM -> Assign order to the nearest delivery person')

    const availableOnDemandDrivers = (await this.driversRepository.find({
      type: 'DELIVER_ON_DEMAND',
      status: 'ONLINE',
      // isValidated: true,
      isDeleted: false,
      available: true,
      acc_status: VendorApprovalStatus.APPROVED
    })) as Driver[]

    this.logger.log(
      `PIM -> ${availableOnDemandDrivers.length} drivers are open to taking the delivery`
    )
    if (availableOnDemandDrivers.length === 0) {
      return null
    }
    const driversCoordinates: DriverWithLocation[] =
      availableOnDemandDrivers.map((driver) => {
        return {
          driverId: driver._id,
          coordinates: driver.location.coordinates
        }
      })

    this.logger.log('PIM -> finding the ideal  driver for this order')

    return await lastValueFrom<DriverWithLocation>(
      this.locationClient.send(QUEUE_MESSAGE.LOCATION_GET_NEAREST_COORD, {
        target: targetCoord,
        coordinates: driversCoordinates
      })
    )
  }

  public streamOrderUpdatesViaSocket (orderId: string, userId: string, orderStatus: OrderStatus): void {
    this.eventsGateway.server.emit(SOCKET_MESSAGE.UPDATE_ORDER_STATUS, {
      user: userId,
      order: orderId,
      status: orderStatus
    })
  }

  public async getDriverStats (driverId: string): Promise<DriverStatGroup> {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const yesterdayStart = new Date(yesterday)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(week)
    weekEnd.setHours(23, 59, 59, 999)

    const monthStart = new Date(month)
    monthStart.setHours(0, 0, 0, 0)

    const monthEnd = new Date(month)
    monthEnd.setHours(23, 59, 59, 999)

    const todayCompletedDelivery: Delivery[] = await this.odsaRepository.find({
      createdAt: {
        $gte: todayStart.toISOString(),
        $lt: todayEnd.toISOString()
      },
      driver: driverId.toString(),
      completed: true
    })

    const yesterdayCompletedDelivery: Delivery[] = await this.odsaRepository.find({
      createdAt: {
        $gte: yesterdayStart.toISOString(),
        $lt: yesterdayEnd.toISOString()
      },
      driver: driverId.toString(),
      completed: true
    })

    const weekCompletedDelivery: Delivery[] = await this.odsaRepository.find({
      createdAt: {
        $gte: weekStart.toISOString(),
        $lt: today.toISOString()
      },
      driver: driverId.toString(),
      completed: true
    })

    const monthCompletedDelivery: Delivery[] = await this.odsaRepository.find({
      createdAt: {
        $gte: monthStart.toISOString(),
        $lt: today.toISOString()
      },
      driver: driverId.toString(),
      completed: true
    })

    const dailyStats: DriverStats = todayCompletedDelivery.reduce((acc, delivery) => {
      return {
        time: acc.time + delivery.travelMeta.travelTime,
        distance: acc.distance + delivery.travelMeta.distance,
        earnings: acc.earnings + 100
      }
    }, { distance: 0, time: 0, earnings: 0 })

    const previousDayStats: DriverStats = yesterdayCompletedDelivery.reduce((acc, delivery) => {
      return {
        time: acc.time + delivery.travelMeta.travelTime,
        distance: acc.distance + delivery.travelMeta.distance,
        earnings: acc.earnings + 100
      }
    }, { distance: 0, time: 0, earnings: 0 })

    const weeklyStats: DriverStats = weekCompletedDelivery.reduce((acc, delivery) => {
      return {
        time: acc.time + delivery.travelMeta.travelTime,
        distance: acc.distance + delivery.travelMeta.distance,
        earnings: acc.earnings + 100
      }
    }, { distance: 0, time: 0, earnings: 0 })

    const monthlyStats: DriverStats = monthCompletedDelivery.reduce((acc, delivery) => {
      return {
        time: acc.time + delivery.travelMeta.travelTime,
        distance: acc.distance + delivery.travelMeta.distance,
        earnings: acc.earnings + 100
      }
    }, { distance: 0, time: 0, earnings: 0 })
    return {
      today: dailyStats,
      yesterday: previousDayStats,
      week: weeklyStats,
      month: monthlyStats
    }
  }
}

function filterOrdersForDay (orders: OrderI[]): OrderI[] {
  const targetDate = moment()

  return orders.filter((order) => {
    const orderDate = moment(order.orderDeliveryScheduledTime)

    return (
      targetDate.isSame(orderDate, 'year') &&
        targetDate.isSame(orderDate, 'month') &&
        targetDate.isSame(orderDate, 'day')
    )
  })
}
