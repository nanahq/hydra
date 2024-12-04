import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import {
  DELIVERY_PRICE_META,
  DeliveryFeeResult,
  DriverWithLocation,
  FitRpcException,
  TravelDistanceResult
} from '@app/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { calculateDeliveryPrice } from '@app/common/utils/calculateDeliveryPrice'
@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name)
  private readonly mapboxToken: string | undefined
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.mapboxToken = configService.get('MAPBOX_TOKEN')
  }

  public async getNearestCoordinate (
    target: number[],
    coordinates: DriverWithLocation[]
  ): Promise<DriverWithLocation | null> {
    let closestCoordinate: DriverWithLocation | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const coord of coordinates) {
      const { duration } = await this.getTravelDistance(
        target,
        coord.coordinates
      )
      if (duration !== undefined) {
        if (duration < minDistance) {
          minDistance = duration
          closestCoordinate = coord
        }
      }
    }

    return closestCoordinate
  }

  public async getTravelDistance (
    origin: number[],
    destination: number[]
  ): Promise<TravelDistanceResult> {
    const apiKey = this.configService.get('GOOGLE_MAPS_API_KEY') as string
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin[0]},${origin[1]}&destinations=${destination[0]},${destination[1]}&key=${apiKey}`

    try {
      this.logger.log('PIM -> Getting travel distance via Google Maps API')
      const { data } = await firstValueFrom(this.httpService.get(url))

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const distance = Math.ceil((data.rows[0].elements[0].distance?.value ?? 0) / 1000) // kilometers
        const duration = Math.ceil((data.rows[0].elements[0].duration?.value ?? 0) / 60) // minutes

        return { distance, duration, destination_addresses: data.destination_addresses[0], origin_addresses: data.origin_addresses[0] }
      }
      this.logger.error('Google Maps API returned an invalid response')
      throw new FitRpcException(
        'Unable to fetch travel distance at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    } catch (error) {
      this.logger.error('Error fetching travel distance via Google Maps API', error)
      throw new FitRpcException(
        'Unable to fetch travel distance at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getDeliveryFee (
    origin: number[],
    destination: number[]
  ): Promise<DeliveryFeeResult> {
    try {
      const { distance, duration } = await this.getTravelDistance(origin, destination)
      const fee = calculateDeliveryPrice(
        distance ?? 0,
        DELIVERY_PRICE_META
      )
      return {
        duration,
        distance,
        fee
      }
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      this.logger.error('Can not get delivery fee via mapbox')
      throw new FitRpcException(
        'Can not fetch travel distance at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getDeliveryFeeDriver (
    origin: number[],
    destination: number[]
  ): Promise<TravelDistanceResult & { fee: number }> {
    try {
      const travelDistance = await this.getTravelDistance(origin, destination)
      const fee = calculateDeliveryPrice(
        travelDistance.distance ?? 0,
        DELIVERY_PRICE_META
      )
      return {
        destination_addresses: travelDistance.destination_addresses,
        origin_addresses: travelDistance.origin_addresses,
        distance: travelDistance?.distance ?? 0,
        duration: travelDistance?.duration ?? 0,
        fee: (fee / 100) * 90 // subtract 10% from delivery fee calculation
      }
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      this.logger.error('Can not get delivery fee via mapbox')
      return {
        destination_addresses: '',
        origin_addresses: '',
        distance: 0,
        duration: 0,
        fee: (850 / 100) * 90 // subtract 10% from delivery fee calculation
      }
    }
  }

  async ping (): Promise<string> {
    return 'PONG'
  }
}
