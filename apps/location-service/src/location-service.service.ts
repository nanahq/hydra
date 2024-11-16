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
  private readonly googleMapsToken: string | undefined
  constructor (
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.googleMapsToken = configService.get('GMAPS_API_KEY')
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
    const baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json'
    const url = `${baseUrl}?origins=${origin[0]},${origin[1]}&destinations=${destination[0]},${destination[1]}&key=${
      this.googleMapsToken as string
    }`

    try {
      this.logger.log('PIM -> Getting travel distance via Google Maps')
      const { data } = await firstValueFrom(this.httpService.get(url))
      return {
        distance: Math.ceil((data?.routes[0]?.distance ?? 0) / 1000), // Killometers
        duration: Math.ceil((data?.routes[0]?.duration ?? 0) / 60) // Minutes
      }
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      this.logger.error('Can not get travel distance via Google Maps')
      throw new FitRpcException(
        'Cannot fetch travel distance at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  public async getDeliveryFee (
    origin: number[],
    destination: number[]
  ): Promise<DeliveryFeeResult> {
    try {
      const travelDistance = await this.getTravelDistance(origin, destination)
      const fee = calculateDeliveryPrice(
        travelDistance.distance ?? 0,
        DELIVERY_PRICE_META
      )
      return {
        ...travelDistance,
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
  ): Promise<DeliveryFeeResult> {
    try {
      const travelDistance = await this.getTravelDistance(origin, destination)
      const fee = calculateDeliveryPrice(
        travelDistance.distance ?? 0,
        DELIVERY_PRICE_META
      )
      return {
        distance: travelDistance?.distance ?? 0,
        duration: travelDistance?.duration ?? 0,
        fee: (fee / 100) * 90 // subtract 10% from delivery fee calculation
      }
    } catch (error) {
      this.logger.log(JSON.stringify(error))
      this.logger.error('Can not get delivery fee via mapbox')
      return {
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
