import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri:
          configService.get<string>('MONGODB_URI', 'mongodb://root:password123@mongodb-primary:27017/')
      }),
      inject: [ConfigService]
    } as any)
  ]
})
export class DatabaseModule {}
