import {  IsOptional } from 'class-validator'
import { LocationCoordinates } from '../database/types/common'

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
}
