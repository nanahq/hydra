import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { LocationCoordinates } from '@app/common'

export class UpdateUserDto {
  @IsOptional()
    email: string

  @IsOptional()
    phone: string

  @IsOptional()
    status: 'ONLINE' | 'OFFLINE'

  @IsOptional()
    location: LocationCoordinates

  @IsOptional()
    firstName: string

  @IsOptional()
    lastName: string

  @IsOptional()
    expoNotificationToken: string
}

export class PaystackInstancePayload {
  @IsOptional()
  @IsString()
    customerId?: string

  @IsNotEmpty()
  @IsString()
    phone: string

  @IsOptional()
  @IsString()
    virtualAccountNumber?: string
}
