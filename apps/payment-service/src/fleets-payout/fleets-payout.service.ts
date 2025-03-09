import { OrderStatus, QUEUE_MESSAGE, IRpcException, FitRpcException, RandomGen, FleetPayout, QUEUE_SERVICE, DeliveryI, Delivery, DriverI } from '@app/common'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FilterQuery } from 'mongoose'
import { lastValueFrom, catchError } from 'rxjs'
import { FleetPayoutRepository } from './fleets-payout.respository'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DriverRepository } from 'apps/drivers-service/src/drivers-service.repository'

@Injectable()
export class FleetPayoutService {
  constructor (
    private readonly fleetPayoutRepository: FleetPayoutRepository,
    private readonly driverRepository: DriverRepository,
    @Inject(QUEUE_SERVICE.DRIVER_SERVICE)
    private readonly driverClient: ClientProxy

  ) {

  }

  async getDriverPayout (driver: string): Promise<FleetPayout[]> {
    return await this.fleetPayoutRepository.findOneAndPopulate({ driver }, ['deliveries'])
  }

  async getAllDriversPayout (organization: string): Promise<FleetPayout[]> {
    const drivers: DriverI[] = await this.driverRepository.find({ organization })

    const driverIds = drivers.map((driver) => driver?._id?.toString())

    return await this.fleetPayoutRepository.findAndPopulate(
      { driver: { $in: driverIds } },
      ['deliveries']
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'Africa/Lagos'
  })
  async handlePayoutComputation (): Promise<void> {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    const start = new Date(yesterday)
    start.setHours(0, 0, 0, 0)

    const end = new Date(yesterday)
    end.setHours(23, 59, 59, 999)

    const filter: FilterQuery<Delivery> = {
      createdAt: {
        $gte: start.toISOString(),
        $lt: end.toISOString()
      },
      status: OrderStatus.FULFILLED,
      organization: { $exists: true, $ne: null },
      completed: true,
      driver: { $exists: true, $ne: null }
    }
    const deliveries = await lastValueFrom<DeliveryI[]>(
      this.driverClient.send(QUEUE_MESSAGE.ADMIN_GET_DELIVERIES, filter).pipe(
        catchError((error: IRpcException) => {
          throw new FitRpcException(error.message, error.status)
        })
      )
    )

    function getOrganizationDeliveries (orgId: string): string[] {
      return deliveries
          ?.filter(delivery => delivery?.driver?.organization === orgId)
          ?.map(delivery => delivery._id.toString()) as any
    }

    // Compute earnings for each driver
    const organizationEarnings = new Map<string, number>()

    deliveries.forEach((delivery) => {
      const organizationId = delivery.driver?.organization?.toString()
      const earnings = organizationEarnings.get(organizationId) ?? 0
      organizationEarnings.set(
        organizationId,
        earnings + Number(delivery.deliveryFee)
      )
    })

    const payoutsToMake: Array<Partial<FleetPayout>> = []

    for (const [organization, earnings] of organizationEarnings) {
      payoutsToMake.push({
        refId: RandomGen.genRandomNum(10, 7),
        organization,
        earnings,
        paid: false,
        deliveries: getOrganizationDeliveries(organization) ?? []
      })
    }

    await this.fleetPayoutRepository.insertMany(payoutsToMake)
  }
}
