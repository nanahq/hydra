import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { LocationCoordinates, SOCKET_MESSAGE } from '@app/common'
import { Logger } from '@nestjs/common'
import { EventsService } from './events.service'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway {
  @WebSocketServer()
    server: Server

  private readonly logger = new Logger(EventsGateway.name)

  constructor (
    private readonly eventService: EventsService
  ) {}

  @SubscribeMessage(SOCKET_MESSAGE.UPDATE_DRIVER_LOCATION)
  async updateDriversLocation (
    @MessageBody() { driverId, location }: { driverId: string, location: LocationCoordinates }
  ): Promise<void> {
    try {
      if (driverId === undefined || location === undefined) {
        throw new Error('failed')
      }
      await this.eventService.updateDriverLocation(driverId, location)
      await this.eventService.updateDeliveryLocation(driverId, location)
    } catch (error) {
      this.logger.error(
        `PIM -> Failed to update location for driver ${driverId}`
      )
    }
  }
}
