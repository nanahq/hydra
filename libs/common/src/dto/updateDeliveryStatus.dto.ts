import { IsNotEmpty, IsString } from 'class-validator'
import { OrderStatus } from '@app/common'

export class UpdateDeliveryStatusDto {
  @IsString()
  @IsNotEmpty()
    deliveryId: string

  @IsString()
  @IsNotEmpty()
    status: OrderStatus
}
