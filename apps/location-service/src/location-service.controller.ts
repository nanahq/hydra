import { Controller } from '@nestjs/common'
import { LocationService } from './location-service.service'
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices'
import { RmqService, QUEUE_MESSAGE, DriverWithLocation } from '@app/common'
@Controller()
export class LocationController {
  constructor (
    private readonly locationService: LocationService,
    private readonly rmqService: RmqService
  ) {}

  @MessagePattern(QUEUE_MESSAGE.LOCATION_GET_NEAREST_COORD)
  async getNearestCoordinate (
    @Payload() { target, coordinates }: { target: string[], coordinates: DriverWithLocation[] },
      @Ctx() context: RmqContext
  ): Promise<DriverWithLocation | null> {
    try {
      return await this.locationService.getNearestCoordinate(target, coordinates)
    } catch (error) {
      throw new RpcException(error)
    } finally {
      this.rmqService.ack(context)
    }
  }
}
