import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri:
          'mongodb://root:password123@mongodb-primary:27017/' ??
          configService.get<string>('MONGODB_URI')
      }),
      inject: [ConfigService]
    } as any)
  ]
})
export class DatabaseModule {}
