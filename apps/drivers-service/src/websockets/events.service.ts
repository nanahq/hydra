import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { OdsaRepository } from '../ODSA/odsa.repository'
import { FitRpcException, LocationCoordinates, OrderStatus } from '@app/common'
import { DriverRepository } from '../drivers-service.repository'

@Injectable()
export class EventsService {
  private readonly logger = new Logger()
  constructor (
    private readonly odsaRepository: OdsaRepository,
    private readonly driverRepository: DriverRepository

  ) {}

  async updateDeliveryLocation (driverId: string, location: LocationCoordinates): Promise<void> {
    try {
      await this.odsaRepository.findAndUpdate({ assignedToDriver: true, driver: driverId, status: OrderStatus.IN_ROUTE }, { currentLocation: location })
    } catch (error) {
      throw new FitRpcException('failed to update Delivery location. Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateDriverLocation (_id: string, location: LocationCoordinates): Promise<void> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id },
        { location }
      )
    } catch (error) {
      throw new FitRpcException('Failed to updated drivers location. Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}