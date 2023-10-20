import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices'
import { RmqModuleOptions } from './interface'
import { RmqService } from './rmq.service'
import * as process from 'process'
@Module({
  providers: [RmqService],
  exports: [RmqService]
})
export class RmqModule {
  static register ({ name, fallback }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService): RmqOptions => ({
              transport: Transport.RMQ,
              options: {
                urls: [process.env.NODE_ENV === 'test' ? configService.get<string>('TEST_RMQ_URI') as string : configService.get<string>('RMQ_URI') as string],
                queue: configService.get<string>(`RMQ_${name}_QUEUE`) as string ?? fallback
              }
            }),
            inject: [ConfigService]
          }
        ])
      ],
      exports: [ClientsModule]
    }
  }
}
