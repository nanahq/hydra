import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import {
  Delivery,
  Driver,
  DriverWithLocation,
  FitRpcException,
  Order,
  OrderStatus,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus, VendorApprovalStatus
} from '@app/common'
import { groupOrdersByDeliveryTime } from './algo/groupOrdersByDeliveryTime'
import { DriverRepository } from '../drivers-service.repository'
import { OdsaRepository } from './odsa.repository'

const PendingDeliveryStatuses: OrderStatus[] = [
  OrderStatus.IN_ROUTE,
  OrderStatus.COLLECTED,
  OrderStatus.PROCESSED
]

@Injectable()
export class ODSA {
  private readonly logger = new Logger(ODSA.name)

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
      this.logger.error({
        message: `PIM -> Failed to query pending deliveries for driver ${driverId}`,
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

      const delivery = await this.odsaRepository.findOne({
        driver: data.driverId,
        _id: data.deliveryId
      })

      await this.orderClient.emit(QUEUE_MESSAGE.UPDATE_ORDER_STATUS, {
        orderId: delivery.order,
        status: data.status
      })

      await this.odsaRepository.findOneAndUpdate(
        { _id: delivery._id },
        { status: data.status }
      )

      this.logger.log('PIM -> Success: Updated delivery status')

      return { status: 1 }
    } catch (error) {
      this.logger.error({
        error,
        message: `Failed to update delivery status for id: ${data.deliveryId}`
      })
      throw new FitRpcException(
        'Failed to update delivery status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async handleProcessOrder (
    orderId: string,
    existingDeliver?: boolean
  ): Promise<void> {
    this.logger.log(`PIM -> started processing instant order: ${orderId}`)
    try {
      const order = await lastValueFrom<any>(
        this.orderClient
          .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, {
            userId: '',
            data: { orderId }
          })
          .pipe(
            catchError((error) => {
              this.logger.error(error)
              throw new RpcException(error)
            })
          )
      )

      const collectionLocation = order?.vendor?.location?.coordinates // address for the vendor/restaurant
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
            deliveryTime: parseInt(order.orderDeliveryScheduledTime),
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location,
            assignedToDriver: false
          })
        }
        return
      }

      if (existingDeliver !== undefined && existingDeliver) {
        await this.odsaRepository.findOneAndUpdate(
          { order: orderId },
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
          deliveryTime: parseInt(order.orderDeliveryScheduledTime),
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
      this.logger.error({
        error,
        message: `Something went wrong processing order ${orderId}`
      })
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
    const unassignedDeliveries = (await this.odsaRepository.find({
      assignedToDriver: false
    })) as Delivery[]
    // @Todo(siradji) improve code and add additional check to make sure only on demand orders get assigned
    try {
      for (const delivery of unassignedDeliveries) {
        await this.handleProcessOrder(delivery.order, true)
      }
    } catch (error) {
      this.logger.error({
        error,
        message: 'failed to assign failed orders'
      })
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
