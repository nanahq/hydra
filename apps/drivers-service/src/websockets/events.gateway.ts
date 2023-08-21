import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { LocationCoordinates, SOCKET_MESSAGE } from '@app/common'
import { Logger } from '@nestjs/common'
import { DriverRepository } from '../drivers-service.repository'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name)
  constructor (
    private readonly driverRepository: DriverRepository,
  ) {
  }

  @WebSocketServer()
    server: Server

  @SubscribeMessage(SOCKET_MESSAGE.UPDATE_DRIVER_LOCATION)
  async updateDriversLocation (@MessageBody() data: { driverId: string, location: LocationCoordinates }): Promise<void> {
    try {
      await this.driverRepository.findOneAndUpdate({ _id: data.driverId }, { location: data.location })
    } catch (error) {
      this.logger.error(`PIM -> Failed to update location for driver ${data.driverId}`)
    }
  }
}
