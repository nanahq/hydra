import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport, RmqOptions } from '@nestjs/microservices'
import { RmqModuleOptions } from './interface'
import { RmqService } from './rmq.service'

@Module({
  providers: [RmqService],
  exports: [RmqService]
})
export class RmqModule {
  static register ({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService): RmqOptions => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RMQ_URI') as string],
                queue: configService.get<string>(`RMQ_${name}_QUEUE`) as string
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
