import {
  MessageBody, OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { LocationCoordinates, SOCKET_MESSAGE, TravelDistanceResult } from '@app/common'
import { Logger } from '@nestjs/common'
import { EventsService } from './events.service'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
    server: Server

  private readonly logger = new Logger(EventsGateway.name)

  constructor (private readonly eventService: EventsService) {}

  async handleConnection (client: Socket, ...args: any[]): Promise<void> {
    const deliveryId = client?.handshake?.query?.deliveryId as string | null
    if (deliveryId !== null) {
      await client.join(deliveryId)
      this.logger.log(`Client connected to delivery room: ${deliveryId}`)
    }
  }

  @SubscribeMessage(SOCKET_MESSAGE.UPDATE_DRIVER_LOCATION)
  async updateDriversLocation (
    @MessageBody()
      { driverId, location, travelDistance }: { driverId: string, location: LocationCoordinates, travelDistance: TravelDistanceResult }
  ): Promise<void> {
    try {
      await this.eventService.updateDriverLocation(driverId, location)

      const deliveryId = await this.eventService.updateDeliveryLocation(driverId, location)

      if (deliveryId !== null) {
        this.server.emit(SOCKET_MESSAGE.DRIVER_LOCATION_UPDATED, { location, deliveryId, travelDistance })
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      this.logger.error(`Failed to update location for driver ${driverId}`)
    }
  }
}
