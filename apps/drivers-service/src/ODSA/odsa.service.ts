import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import {
  Delivery,
  FitRpcException,
  Order,
  OrderStatus,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus
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

    private readonly driversRepository: DriverRepository,

    private readonly odsaRepository: OdsaRepository
  ) {}

  public async queryPendingDeliveries (driverId: string): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null = await this.odsaRepository.findAndPopulate({ driver: driverId }, ['listing', 'vendor', 'user', 'order'])

      return deliveries?.filter(dv => PendingDeliveryStatuses.includes(dv.status as any))
    } catch (error) {
      this.logger.error({
        message: `PIM -> Failed to query pending deliveries for driver ${driverId}`,
        error
      })
    }
  }

  public async queryFulfilledDeliveries (driverId: string): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null = await this.odsaRepository.findAndPopulate({ driver: driverId }, ['listing', 'vendor', 'user', 'order'])

      return deliveries?.filter(dv => dv.status === OrderStatus.FULFILLED)
    } catch (error) {
      this.logger.error({
        message: `PIM -> Failed to query pending deliveries for driver ${driverId}`,
        error
      })
    }
  }

  public async handleUpdateDeliveryStatus (data: { status: OrderStatus, driverId: string, deliveryId: string }): Promise<ResponseWithStatus> {
    try {
      this.logger.log('PIM -> Updating delivery status')

      const delivery = await this.odsaRepository.findOne({ driver: data.driverId, _id: data.deliveryId })

      await this.orderClient.emit(QUEUE_MESSAGE.UPDATE_ORDER_STATUS, { orderId: delivery.order, status: data.status })

      await this.odsaRepository.findOneAndUpdate({ _id: delivery._id }, { status: data.status })

      this.logger.log('PIM -> Success: Updated delivery status')

      return { status: 1 }
    } catch (error) {
      this.logger.error({
        error,
        message: `Failed to update delivery status for id: ${data.deliveryId}`
      })
      throw new FitRpcException('Failed to update delivery status', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async handleAssignOrder (): Promise<void> {}
  public async handleProcessOrder (orderId: string): Promise<void> {
    this.logger.log(orderId)
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Africa/Lagos'
  })
  private async sortAndAssignPreOrders (): Promise<void> {
    const today = new Date().toLocaleDateString()
    this.logger.log(`PIM -> sorting and processing pre orders for ${today}`)

    const orders = await lastValueFrom<any>(
      this.orderClient.send(QUEUE_MESSAGE.ODSA_GET_ORDERS_PRE, {})
        .pipe(catchError(error => {
          throw new RpcException(error)
        }))
    )
    const drivers = await this.driversRepository.find({ isValidated: true, type: 'DELIVER_PRE_ORDER' })

    const ordersForToday = filterOrdersForDay(orders)

    this.logger.log(`PIM -> Found ${ordersForToday.length} orders scheduled for delivery today`)

    const groupedOrders = groupOrdersByDeliveryTime(orders, drivers !== null ? drivers?.length : 0)

    this.logger.log(`PIM -> Grouped ${ordersForToday.length} orders scheduled for delivery today`)

    await this.assignPreOrdersDelivery(groupedOrders, drivers)
  }

  private async assignPreOrdersDelivery (groupedOrders: any[], drivers: any[]): Promise<void> {
    if (drivers?.length <= 0 || groupedOrders?.length <= 0) {
      this.logger.log(`PIM -> Assigning ${groupedOrders.length} grouped orders to ${drivers.length}`)
      return
    }

    this.logger.log(`PIM -> Assigning ${groupedOrders.length} grouped orders to ${drivers.length}`)

    const newDeliveries: Array<Partial<Delivery>> = []

    groupedOrders.forEach(group => {
      group.orders.forEach(order => {
        drivers.forEach(driver => {
          newDeliveries.push({
            listing: order.listing._id,
            order: order._id,
            vendor: order.vendor._id,
            user: order.user._id,
            driver: driver._id,
            deliveryTime: parseInt(order.orderDeliveryScheduledTime),
            dropOffLocation: order.preciseLocation,
            pickupLocation: order.vendor.location
          })
        })
      })
    })

    await this.odsaRepository.insertMany(newDeliveries)

    this.logger.log(`PIM -> Success: Assigned ${groupedOrders.length} grouped orders to ${drivers.length} drivers`)
  }
}

function filterOrdersForDay (orders: Order[]): Order[] {
  const filteredOrders: Order[] = []

  const targetDate = new Date(2023, 7, 16)
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()
  const targetDay = targetDate.getDate()

  for (const order of orders) {
    const orderDate = new Date(Number(order.orderDeliveryScheduledTime))
    const orderYear = orderDate.getFullYear()
    const orderMonth = orderDate.getMonth()
    const orderDay = orderDate.getDate()

    if (targetYear === orderYear && targetMonth === orderMonth && targetDay === orderDay) {
      filteredOrders.push(order)
    }
  }
  return filteredOrders
}
