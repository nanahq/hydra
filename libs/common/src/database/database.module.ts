import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '@app/common/database/entities/User'
import { VendorEntity } from '@app/common/database/entities/Vendor'
import { AdminEntity } from '@app/common/database/entities/Admin'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') as string,
        port: configService.get<string>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [UserEntity, VendorEntity],
        synchronize: configService.get<string>('env') === 'development'
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') as string,
        port: configService.get<string>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [UserEntity],
        synchronize: configService.get<string>('env') === 'development'
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') as string,
        port: configService.get<string>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [AdminEntity],
        synchronize: configService.get<string>('env') === 'development'
      }),
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {}
