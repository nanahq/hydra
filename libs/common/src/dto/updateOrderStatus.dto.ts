import { OrderStatus } from '@app/common'
import { IsNotEmpty } from 'class-validator'

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
    status: OrderStatus

  @IsNotEmpty()
    orderId: string
}

export class UpdateOrderStatusPaidRequestDto {
  @IsNotEmpty()
    status: OrderStatus

  @IsNotEmpty()
    orderId: string

  @IsNotEmpty()
    txRefId: string
}
