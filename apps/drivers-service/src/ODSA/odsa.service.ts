import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import {
  Delivery,
  DeliveryI,
  Driver,
  DriverWithLocation,
  FitRpcException,
  Order,
  OrderI,
  OrderStatus,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus, TravelDistanceResult,
  VendorApprovalStatus
} from '@app/common'
import { groupOrdersByDeliveryTime } from './algo/groupOrdersByDeliveryTime'
import { DriverRepository } from '../drivers-service.repository'
import { OdsaRepository } from './odsa.repository'
import * as moment from 'moment'

const PendingDeliveryStatuses: OrderStatus[] = [
  OrderStatus.IN_ROUTE,
  OrderStatus.COLLECTED,
  OrderStatus.PROCESSED
]

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
    private readonly odsaRepository: OdsaRepository
  ) {}

  public async queryPendingDeliveries (
    driverId: string
  ): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null =
        await this.odsaRepository.findAndPopulate({ driver: driverId }, [
          'listing',
          'vendor',
          'user',
          'order'
        ])

      return deliveries?.filter((dv) =>
        PendingDeliveryStatuses.includes(dv.status as any)
      )
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
        'driver'
      ])) as DeliveryI
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
        await this.odsaRepository.findAndPopulate({ driver: driverId }, [
          'listing',
          'vendor',
          'user',
          'order'
        ])

      return deliveries?.filter((dv) => dv.status === OrderStatus.FULFILLED)
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
      }, ['order', 'vendor']) as DeliveryI

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
          this.locationClient.send(QUEUE_MESSAGE.LOCATION_GET_ETA, { userCoords: delivery.order.preciseLocation.coordinates, vendorCoords: delivery.vendor.location?.coordinates })
        )
        deliveryTime.setMinutes(deliveryTime.getMinutes() + (travelDistance.duration ?? 20))
        updates.deliveryTime = deliveryTime.getTime()
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
        const driver = await this.driversRepository.findOne({ _id: delivery.driver }) as Driver

        const deliveries = [...driver.deliveries, delivery._id]
        const totalTrips = driver.totalTrips + 1

        await this.driversRepository.findOneAndUpdate({ _id: driver._id }, { available: true, deliveries, totalTrips })
      }

      this.logger.log('PIM -> Success: Updated delivery status')

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
            listing: order.listing._id,
            order: order._id,
            vendor: order.vendor?._id,
            user: order.user._id,
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location,
            assignedToDriver: false
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
          listing: order.listing._id,
          order: order._id,
          vendor: order.vendor?._id,
          user: order.user._id,
          dropOffLocation: order.preciseLocation,
          pickupLocation: order.vendor.location,
          assignedToDriver: true
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

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Africa/Lagos'
  })
  private async assignDemandOrders (): Promise<void> {
    const unassignedDeliveries = await this.odsaRepository.findAndPopulate({
      assignedToDriver: false
    }, ['order']) as any

    const filteredDeliveries = unassignedDeliveries.filter((delivery) => delivery.order.orderType === 'ON_DEMAND')

    try {
      for (const delivery of filteredDeliveries) {
        await this.handleProcessOrder(delivery.order, true, delivery._id)
      }
    } catch (error) {
      this.logger.error('failed to assign orders')
      this.logger.error(JSON.stringify(error))
    }
  }

  /**
   * Odsa Cron for pre-order. Runs daily @ 8AM WAT to assign orders to drivers
   * @private
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    timeZone: 'Africa/Lagos'
  })
  private async sortAndAssignPreOrders (): Promise<void> {
    const today = new Date().toLocaleDateString()
    this.logger.log(`PIM -> sorting and processing pre orders for ${today}`)

    const orders = await lastValueFrom<any>(
      this.orderClient.send(QUEUE_MESSAGE.ODSA_GET_ORDERS_PRE, {}).pipe(
        catchError((error) => {
          throw new RpcException(error)
        })
      )
    )
    const drivers = await this.driversRepository.find({
      isValidated: true,
      type: 'DELIVER_PRE_ORDER',
      acc_status: VendorApprovalStatus.APPROVED
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
            listing: order.listing._id,
            order: order._id,
            vendor: order.vendor._id,
            user: order.user._id,
            driver: driver._id,
            deliveryTime: parseInt(order.orderDeliveryScheduledTime),
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location,
            assignedToDriver: true
          })
        })
      })
    })

    await this.odsaRepository.insertMany(newDeliveries)

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
}

function filterOrdersForDay (orders: Order[]): Order[] {
  const filteredOrders: Order[] = []

  const targetDate = new Date()
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()
  const targetDay = targetDate.getDate()

  for (const order of orders) {
    const orderDate = new Date(Number(order.orderDeliveryScheduledTime))
    const orderYear = orderDate.getFullYear()
    const orderMonth = orderDate.getMonth()
    const orderDay = orderDate.getDate()

    if (
      targetYear === orderYear &&
      targetMonth === orderMonth &&
      targetDay === orderDay
    ) {
      filteredOrders.push(order)
    }
  }
  return filteredOrders
}
