import { IsNotEmpty } from 'class-validator'

export class UpdateVendorStatus {
  @IsNotEmpty()
    id: string

  @IsNotEmpty()
    status: 'ONLINE' | 'OFFLINE'
}
