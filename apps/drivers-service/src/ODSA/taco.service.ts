import { Injectable } from '@nestjs/common'
import { DriverRepository } from '../drivers-service.repository'
import { S2 } from 's2-geometry'
import { Driver } from '@app/common'
@Injectable()
export class TacoService {
  constructor (private readonly driverRepository: DriverRepository) {}

  /**
   * Finds the nearest drivers based on latitude and longitude, using the S2 geometry library.
   * @param lat Latitude of the location.
   * @param lng Longitude of the location.
   * @param level Radius in kilometers to search for drivers.
   * @returns List of nearby drivers.
   */
  public async findNearestDriver (lat: number, lng: number, level: number): Promise<Driver[]> {
    const nearbyCellIds = this.getNearbyS2Cells(lat, lng, 16)
    const formated: string[] = []
    nearbyCellIds.forEach(cell => {
      formated.push(this.cellIdToNumber(cell, 'addition'))
      formated.push(this.cellIdToNumber(cell, 'subtraction'))
    })

    const drivers = await this.driverRepository
      .findRaw()
      .find({
        s2CellId: { $in: formated },
        available: true,
        status: 'ONLINE'
      })

    return drivers
  }

  /**
   * Updates the driver's location and S2 cell ID in the database.
   * @param lat Latitude of the driver's location.
   * @param lng Longitude of the driver's location.
   * @param driverId ID of the driver to update.
   */
  public async updateDriverLocation (lat: number, lng: number, driverId: string): Promise<void> {
    try {
      const s2CellId = S2.latLngToKey(lat, lng, 14)

      await this.driverRepository.findOneAndUpdate(
        { _id: driverId },
        {

          s2CellId,
          location: {
            type: 'Point',
            coordinates: [lat, lng]
          }
        }
      )
    } catch (error) {
      console.error('Error updating driver location:', error)
    }
  }

  /**
   * Ranks drivers based on their distance to the order coordinates.
   * @param drivers List of drivers to rank.
   * @param orderCoords Coordinates of the order.
   * @returns List of drivers sorted by proximity to the order.
   */
  public rankDrivers (drivers: Driver[], orderCoords: { lat: number, lng: number }): Driver[] {
    return drivers.sort(
      (a, b) => this.calculateDistance(a, orderCoords) - this.calculateDistance(b, orderCoords)
    ).slice(0, 5)
  }

  /**
   * Calculates the distance between a driver's location and the order coordinates.
   * @param driver Driver's location.
   * @param orderCoords Coordinates of the order.
   * @returns Distance in kilometers.
   */
  public calculateDistance (driver: Driver, orderCoords: { lat: number, lng: number }): number {
    const [driverLng, driverLat] = driver.location.coordinates
    // Calculate the Haversine distance (more precise than the default S2 distance)
    return this.haversineDistance(driverLat, driverLng, orderCoords.lat, orderCoords.lng)
  }

  /**
   * Matches drivers to an order based on proximity.
   * @param orderPickupCoords Coordinates of the order pickup location.
   * @returns List of ranked drivers.
   */
  public async matchDriversToOrder (orderPickupCoords: { lat: number, lng: number }): Promise<Driver[]> {
    const nearbyDrivers = await this.findNearestDriver(orderPickupCoords.lat, orderPickupCoords.lng, 2)
    console.log({ nearbyDrivers })
    return this.rankDrivers(nearbyDrivers, orderPickupCoords)
  }

  /**
   * Helper function to get nearby S2 cell IDs based on the given latitude, longitude, and radius.
   * @param lat Latitude of the location.
   * @param lng Longitude of the location.
   * @param radius Radius to search within.
   * @returns List of S2 cell IDs.
   */
  private getNearbyS2Cells (lat: number, lng: number, radius: number): string[] {
    // Dynamic S2 cell level based on the search radius
    return S2.latLngToNeighborKeys(lat, lng, radius)
  }

  /**
   * Determines the appropriate S2 cell level based on the search radius.
   * @param radius Search radius in kilometers.
   * @returns Appropriate S2 cell level.
   */
  private getS2CellLevel (radius: number): number {
    if (radius <= 1) {
      return 15
    }
    if (radius <= 5) {
      return 14
    }
    if (radius <= 20) {
      return 12
    }
    return 10 // Larger search area for greater radius
  }

  /**
   * Calculates the Haversine distance between two points.
   * @param lat1 Latitude of the first point.
   * @param lng1 Longitude of the first point.
   * @param lat2 Latitude of the second point.
   * @param lng2 Longitude of the second point.
   * @returns Distance in kilometers.
   */
  private haversineDistance (lat1: number, lng1: number, lat2: number, lng2: number): number {
    function toRad (angle: number): number {
      return (angle * Math.PI) / 180
    }
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private cellIdToNumber (cellId: string, type: 'addition' | 'subtraction'): string {
    const part = cellId.split('/')[1]

    if (type === 'addition') {
      const sum = Number(part) + 1
      return `0/${sum}`
    }
    const sum = Number(part) - 1
    return `0/${sum}`
  }
}
