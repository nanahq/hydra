import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { DriverWithLocation, FitRpcException } from '@app/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

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
    target: string[],
    coordinates: DriverWithLocation[]
  ): Promise<DriverWithLocation | null> {
    let closestCoordinate: DriverWithLocation | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const coord of coordinates) {
      const distance = await this.getTravelDistance(coord.coordinates, target)
      if (distance < minDistance) {
        minDistance = distance
        closestCoordinate = coord
      }
    }

    return closestCoordinate
  }

  public async getTravelDistance (
    origin: string[],
    destination: string[]
  ): Promise<number> {
    try {
      this.logger.log('PIM -> Getting travel distance via mapbox')
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${
        origin[0]
      },${origin[1]};${destination[0]},${destination[1]}?access_token=${
        this.mapboxToken as string
      }`
      const { data } = await firstValueFrom(this.httpService.get(url))
      return data?.routes[0]?.duration
    } catch (error) {
      this.logger.error({
        error,
        message: 'Can not get travel distance via mapbox'
      })
      throw new FitRpcException(
        'Can not fetch travel distance at this time',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
