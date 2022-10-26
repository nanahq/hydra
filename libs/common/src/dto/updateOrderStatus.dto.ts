import { OrderStatus } from '@app/common'
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
    status: OrderStatus

  @IsNotEmpty()
  @IsUUID(4)
    orderId: string
}
