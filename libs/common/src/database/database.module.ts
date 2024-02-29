import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'
import * as process from 'process'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri:
          process.env.NODE_ENV === 'test'
            ? configService.get<string>('TEST_MONGODB_URI')
            : configService.get<string>(
              'MONGODB_URI',
              'mongodb://root:password123@mongodb-primary:27017/'
            )
      }),
      inject: [ConfigService]
    } as any)
  ]
})
export class DatabaseModule {}
