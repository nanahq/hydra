import { Injectable } from '@nestjs/common'
import { DriverRepository } from '../drivers-service.repository'
import { Driver, VendorApprovalStatus } from '@app/common'
@Injectable()
export class TacoService {
  constructor (private readonly driverRepository: DriverRepository) {}

  public async findNearestDriver (lat: number, lng: number, radius: number): Promise<Driver[]> {
    const drivers = await this.driverRepository
      .find({
        available: true,
        status: 'ONLINE',
        acc_status: VendorApprovalStatus.APPROVED,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $minDistance: 10,
            $maxDistance: 4000
          }
        }
      })
    return drivers
  }

  public async updateDriverLocation (lat: number, lng: number, driverId: string): Promise<void> {
    try {
      await this.driverRepository.findOneAndUpdate(
        { _id: driverId },
        {
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      )
    } catch (error) {
      console.error('Error updating driver location:', error)
    }
  }

  public async matchDriversToOrder (orderPickupCoords: { lat: number, lng: number }): Promise<Driver[]> {
    return await this.findNearestDriver(orderPickupCoords.lat, orderPickupCoords.lng, 5000)
  }
}
