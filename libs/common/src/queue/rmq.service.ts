import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RmqOptions, RmqContext, Transport, ClientProxy } from '@nestjs/microservices'

@Injectable()
export class RmqService {
  private readonly clients: Record<string, ClientProxy> = {}

  constructor (private readonly configService: ConfigService) {}

  getOption (queue: string, noAck = false, fallbackUri?: string): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [
          fallbackUri ?? (this.configService.get<string>('RMQ_URI') as string)
        ],
        queue: this.configService.get<string>(`RMQ_${queue}_QUEUE`),
        noAck,
        persistent: true
      }
    }
  }

  ack (context: RmqContext): void {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    channel.ack(originalMessage)
  }
}
