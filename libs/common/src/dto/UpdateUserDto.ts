import { IsNotEmpty } from 'class-validator'
import { LocationCoordinates } from '../database/types/common'

export class UpdateUserDto {
  @IsNotEmpty()
    email: string

  @IsNotEmpty()
    phone: string

  @IsNotEmpty()
    status: 'ONLINE' | 'OFFLINE'

  @IsNotEmpty()
    location: LocationCoordinates
}
