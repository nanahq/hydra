import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RmqOptions, RmqContext, Transport } from '@nestjs/microservices'
import * as process from 'process'

@Injectable()
export class RmqService {
  constructor (private readonly configService: ConfigService) {}

  getOption (queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.NODE_ENV === 'test' ? this.configService.get<string>('TEST_RMQ_URI') as string : this.configService.get<string>('RMQ_URI') as string],
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
