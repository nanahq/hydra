import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import {
  Delivery,
  DeliveryI,
  Driver,
  DriverStatGroup,
  DriverStats,
  FitRpcException,
  OrderI,
  OrderStatus,
  OrderTypes,
  OrderUpdateStream,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  SOCKET_MESSAGE,
  subtractFivePercent,
  TravelDistanceResult
} from '@app/common'
import { DriverRepository } from '../drivers-service.repository'
import { OdsaRepository } from './odsa.repository'
import * as moment from 'moment'
import { FilterQuery } from 'mongoose'
import { EventsGateway } from '../websockets/events.gateway'
import { TacoService } from './taco.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ODSA {
  private readonly logger = new Logger(ODSA.name)
  private readonly MAX_ORDER_EXPIRY = 30 // minutes
  constructor (
    @Inject(QUEUE_SERVICE.ORDERS_SERVICE)
    private readonly orderClient: ClientProxy,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(QUEUE_SERVICE.LOCATION_SERVICE)
    private readonly locationClient: ClientProxy,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly driversRepository: DriverRepository,
    private readonly odsaRepository: OdsaRepository,
    private readonly configService: ConfigService,

    //   Websocket gateway injection for order status updates
    private readonly eventsGateway: EventsGateway,

    private readonly tacoService: TacoService
  ) {}

  public async queryPendingDeliveries (
    driverId: string
  ): Promise<Delivery[] | undefined> {
    try {
      const deliveries: Delivery[] | null =
        await this.odsaRepository.findAndPopulate(
          {
            driver: driverId.toString(),
            status: { $ne: OrderStatus.FULFILLED }
          },
          ['listing', 'vendor', 'user', 'order']
        )
      return deliveries
    } catch (error) {
      this.logger.error(
        `PIM -> Failed to query pending deliveries for driver ${driverId}`
      )
      this.logger.error(JSON.stringify(error))
    }
  }

  public async queryOrderDelivery (
    orderId: string
  ): Promise<DeliveryI | undefined> {
    try {
      return await this.odsaRepository.findOneAndPopulate<DeliveryI>(
        { order: orderId },
        ['order', 'driver', 'listing', 'vendor', 'user']
      )
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryDayDeliveries (
    driverId: string
  ): Promise<DeliveryI[] | undefined> {
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
      return await this.odsaRepository.findAndPopulate(filters, [
        'order',
        'driver',
        'listing'
      ])
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryVendorDeliveries (
    vendor: string
  ): Promise<DeliveryI[] | undefined> {
    try {
      return await this.odsaRepository.findAndPopulate({ vendor }, [
        'listing',
        'order',
        'driver'
      ])
    } catch (error) {
      this.logger.error({
        message: 'PIM -> Failed to query all deliveries',
        error
      })
    }
  }

  public async queryAllDeliveries (): Promise<Delivery[] | undefined> {
    try {
      return await this.odsaRepository.findAndPopulate({}, [
        'listing',
        'vendor',
        'user',
        'order',
        'driver'
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
        await this.odsaRepository.findAndPopulate(
          { driver: driverId.toString() },
          ['listing', 'vendor', 'user', 'order']
        )

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

      const delivery = await this.odsaRepository.findOneAndPopulate<DeliveryI>(
        {
          _id: data.deliveryId
        },
        ['order', 'vendor', 'user']
      )

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
          this.locationClient.send(QUEUE_MESSAGE.LOCATION_GET_ETA, {
            vendorCoords: delivery.pickupLocation.coordinates,
            userCoords: delivery.dropOffLocation.coordinates
          })
        )

        deliveryTime.setMinutes(
          deliveryTime.getMinutes() + (travelDistance.duration ?? 20)
        )
        updates.deliveryTime = moment(deliveryTime).toISOString()
        updates.travelMeta = {
          distance: travelDistance?.distance ?? 0,
          travelTime: travelDistance?.duration ?? 0
        }
      }

      const delivered = data.status === OrderStatus.FULFILLED

      let deliveredWithinTime: boolean = true

      if (delivered) {
        deliveredWithinTime = moment().isSameOrBefore(
          new Date(delivery.deliveryTime)
        )
        updates.deliveredWithinTime = deliveredWithinTime
        updates.completed = true

        if (!deliveredWithinTime) {
          const slackMessage = `Order ${delivery.order._id.toString()} is not delivered within time`
          await lastValueFrom(
            this.notificationClient.emit(QUEUE_MESSAGE.SEND_SLACK_MESSAGE, { text: slackMessage })
          )
        }
      }

      await this.odsaRepository.findOneAndUpdate(
        { _id: delivery._id },
        updates
      )

      if (delivered) {
        const driver = (await this.driversRepository.findOne({
          _id: delivery.driver
        })) as Driver

        const deliveries = [...driver.deliveries, delivery._id.toString()]
        const totalTrips = driver.totalTrips + 1

        await this.driversRepository.findOneAndUpdate(
          { _id: driver._id.toString() },
          { available: true, deliveries, totalTrips }
        )
      }

      this.logger.log('PIM -> Success: Updated delivery status')

      const streamPayload: OrderUpdateStream = {
        userId: delivery.user._id,
        orderId: delivery.order._id,
        status: data.status,
        driver: delivery.driver,
        vendorName: delivery.vendor.businessName
      }

      // Emit socket event -> Order Status update
      this.streamOrderUpdatesViaSocket(streamPayload)

      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error(
        `Failed to update delivery status for id: ${data.deliveryId}`
      )
      throw new FitRpcException(
        'Failed to update delivery status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async handleAcceptDelivery (opts: {
    deliveryId: string
    driverId: string
  }): Promise<ResponseWithStatus> {
    try {
      const updated = await this.odsaRepository.findOneAndUpdate(
        { _id: opts.deliveryId, assignedToDriver: false },
        { driver: opts.driverId, assignedToDriver: true }
      )
      if (updated === null) {
        return { status: 0 }
      }
      await this.driversRepository.findOneAndUpdate({ _id: opts.driverId, available: true }, { available: false })
      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not accept delivery  right now',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async driverFetchAvailableDeliveries (driverId: string): Promise<Delivery[]> {
    const deliveries = await this.odsaRepository
      .findRaw()
      .find({ assignedToDriver: true, driver: driverId, completed: false, status: { $ne: OrderStatus.FULFILLED } })
      .populate('vendor')
      .populate('listing')
      .populate('user')
      .populate({
        path: 'order',
        populate: {
          path: 'listing'
        }
      })
      .exec()
    if (deliveries.length > 0) {
      return deliveries
    }
    return await this.odsaRepository
      .findRaw()
      .find({ assignedToDriver: false, completed: false, status: { $ne: OrderStatus.FULFILLED }, pool: { $in: [driverId] } })
      .populate('vendor')
      .populate({
        path: 'order',
        populate: {
          path: 'listing'
        }
      })
      .exec()
  }

  public async handleRejectDelivery (opts: {
    deliveryId: string
    orderId: string
    driverId: string
  }): Promise<ResponseWithStatus> {
    try {
      await this.odsaRepository.findOneAndUpdate(
        { _id: opts.deliveryId, order: opts.orderId, driver: opts.driverId },
        { assignedToDriver: false, driver: undefined }
      )
      return { status: 1 }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not reject delivery  right now',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async handleProcessOrder (
    _order: string

  ): Promise<void> {
    try {
      const order = await lastValueFrom<OrderI>(
        this.orderClient
          .send(QUEUE_MESSAGE.GET_SINGLE_ORDER_BY_ID, {
            userId: '',
            data: {
              orderId: _order
            }
          })
          .pipe(
            catchError((error: any) => {
              this.logger.error(JSON.stringify(error))
              throw new RpcException(error)
            }) as any
          ) as any
      )
      const collectionLocation = order?.precisePickupLocation?.coordinates as [
        number,
        number,
      ]

      const deliveryMeta = await lastValueFrom<TravelDistanceResult & { fee: number }>(
        this.locationClient
          .send(QUEUE_MESSAGE.LOCATION_GET_DELIVERY_FEE_DRIVER, {
            userCoords: order.preciseLocation.coordinates,
            vendorCoords: collectionLocation
          })
      )

      const driversSuitableForPickup = await this.tacoService.matchDriversToOrder({ lat: collectionLocation[0], lng: collectionLocation[1] })
      await this.odsaRepository.create({
        listing: order.listing.map((li) => li._id),
        order: order._id,
        vendor: order.vendor?._id,
        user: order.user._id,
        dropOffLocation: order.preciseLocation,
        pickupLocation: order.precisePickupLocation,
        assignedToDriver: false,
        deliveryTime: order.orderDeliveryScheduledTime,
        status: order.vendor._id === this.configService.get('BOX_COURIER_VENDOR') ? OrderStatus.COURIER_PICKUP : OrderStatus.PROCESSED,
        deliveryType: order.orderType,
        pool: driversSuitableForPickup.map(driver => driver._id.toString()),
        deliveryFee: subtractFivePercent(order.orderBreakDown.deliveryFee),
        parsedAddress: {
          pickupAddress: deliveryMeta.origin_addresses,
          dropoffAddress: deliveryMeta.destination_addresses
        },
        travelMeta: {
          distance: deliveryMeta.distance ?? 0,
          travelTime: deliveryMeta.duration ?? 0
        }
      })
    } catch (error) {
      this.logger.error(
        `Something went wrong processing order ${_order}`
      )
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not process order right now',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async assignInternalDrivers (
    driverId: string,
    deliveryId: string
  ): Promise<void> {
    try {
      const checkDriver = await this.driversRepository.findOne({
        _id: driverId,
        internal: true,
        available: true
      })

      if (checkDriver !== null) {
        await this.odsaRepository.findOneAndUpdate(
          { _id: deliveryId, assignedToDriver: false },
          { driver: driverId, assignedToDriver: true }
        )
      }
      // update assigned driver status
      await this.driversRepository.findOneAndUpdate(
        { _id: driverId },
        { available: false }
      )
    } catch (error) {
      this.logger.error(
        `Something went wrong processing order with deliveryId: ${deliveryId}`
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
    const unassignedDeliveries = (await this.odsaRepository.findAndPopulate(
      {
        assignedToDriver: false,
        deliveryType: OrderTypes.INSTANT
      },
      ['order', 'vendor']
    )) as any

    try {
      for (const delivery of unassignedDeliveries) {
        const collectionLocation = delivery?.vendor?.location?.coordinates as [
          number,
          number,
        ]

        const driversSuitableForPickup = await this.tacoService.matchDriversToOrder({ lat: collectionLocation[0], lng: collectionLocation[1] })
        await this.odsaRepository.findOneAndUpdate({ _id: delivery._id.toString() }, { pool: driversSuitableForPickup.map(driver => driver._id.toString()) })
      }
    } catch (error) {
      this.logger.error('failed to assign orders')
      this.logger.error(JSON.stringify(error))
    }
  }

  /**
   *  Processes pre-order deliveries. Assign a driver to a pre order delivery when the chosen delivery time is within thirty minutes
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'Africa/Lagos'
  })
  async assignPreOrders (): Promise<void> {
    const currentDate = new Date()
    const thirtyMinutesLater = new Date(currentDate.getTime() + 35 * 60000)

    const unassignedDeliveries = (await this.odsaRepository.findAndPopulate(
      {
        assignedToDriver: false,
        deliveryType: 'PRE_ORDER',
        deliveryTime: {
          $gte: currentDate.toISOString(),
          $lt: thirtyMinutesLater.toISOString()
        }
      },
      ['order', 'vendor']
    )) as any

    if (unassignedDeliveries.length > 0) {
      for (const delivery of unassignedDeliveries) {
        const collectionLocation = delivery?.vendor?.location?.coordinates as [
          number,
          number,
        ]
        const driversSuitableForPickup = await this.tacoService.matchDriversToOrder({ lat: collectionLocation[0], lng: collectionLocation[1] })
        await this.odsaRepository.findOneAndUpdate({ _id: delivery._id.toString() }, { pool: driversSuitableForPickup.map(driver => driver._id.toString()) })
      }
    }
  }

  public streamOrderUpdatesViaSocket (updates: OrderUpdateStream): void {
    this.eventsGateway.server.emit(SOCKET_MESSAGE.UPDATE_ORDER_STATUS, {
      ...updates
    } as any)
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

    const yesterdayCompletedDelivery: Delivery[] =
      await this.odsaRepository.find({
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

    const dailyStats: DriverStats = todayCompletedDelivery.filter(delivery => delivery?.travelMeta !== undefined).reduce(
      (acc, delivery) => {
        return {
          time: acc.time + (delivery?.travelMeta?.travelTime ?? 0),
          distance: acc.distance + (delivery?.travelMeta?.distance ?? 0),
          earnings: acc.earnings + delivery.deliveryFee
        }
      },
      { distance: 0, time: 0, earnings: 0 }
    )

    const previousDayStats: DriverStats = yesterdayCompletedDelivery.filter(delivery => delivery?.travelMeta !== undefined).reduce(
      (acc, delivery) => {
        return {
          time: acc.time + (delivery?.travelMeta?.travelTime ?? 0),
          distance: acc.distance + (delivery?.travelMeta?.distance ?? 0),
          earnings: acc.earnings + delivery.deliveryFee
        }
      },
      { distance: 0, time: 0, earnings: 0 }
    )

    const weeklyStats: DriverStats = weekCompletedDelivery.filter(delivery => delivery?.travelMeta !== undefined).reduce(
      (acc, delivery) => {
        return {
          time: acc.time + (delivery?.travelMeta?.travelTime ?? 0),
          distance: acc.distance + (delivery?.travelMeta?.distance ?? 0),
          earnings: acc.earnings + delivery.deliveryFee
        }
      },
      { distance: 0, time: 0, earnings: 0 }
    )

    const monthlyStats: DriverStats = monthCompletedDelivery.filter(delivery => delivery?.travelMeta !== undefined).reduce(
      (acc, delivery) => {
        return {
          time: acc.time + (delivery?.travelMeta?.travelTime ?? 0),
          distance: acc.distance + (delivery?.travelMeta?.distance ?? 0),
          earnings: acc.earnings + delivery.deliveryFee
        }
      },
      { distance: 0, time: 0, earnings: 0 }
    )
    return {
      today: dailyStats,
      yesterday: previousDayStats,
      week: weeklyStats,
      month: monthlyStats
    }
  }
}
