import { Injectable, Logger } from '@nestjs/common'
import { OdsaRepository } from '../ODSA/odsa.repository'
import {
  Delivery,
  LocationCoordinates
} from '@app/common'
import { DriverRepository } from '../drivers-service.repository'
import { TacoService } from '../ODSA/taco.service'

@Injectable()
export class EventsService {
  private readonly logger = new Logger()
  constructor (
    private readonly odsaRepository: OdsaRepository,
    private readonly driverRepository: DriverRepository,
    private readonly tacoService: TacoService
  ) {}

  async updateDeliveryLocation (
    driverId: string,
    location: LocationCoordinates
  ): Promise<string | undefined> {
    try {
      const delivery: Delivery | null =
        await this.odsaRepository.findOneAndUpdate(
          {
            assignedToDriver: true,
            completed: false,
            driver: driverId
          },
          { currentLocation: location }
        )
      return delivery?._id?.toString() ?? undefined
    } catch (error) {
      this.logger.error(JSON.stringify(error))
    }
  }

  async updateDriverLocation (
    _id: string,
    location: LocationCoordinates
  ): Promise<void> {
    try {
      await this.tacoService.updateDriverLocation(location.coordinates[0], location.coordinates[1], _id)
    } catch (error) {
      this.logger.error(JSON.stringify(error))
    }
  }
}
