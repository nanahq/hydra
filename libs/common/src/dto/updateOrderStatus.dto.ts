import { OrderStatus } from '@app/common'
import {  IsNotEmpty } from 'class-validator'

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
    status: OrderStatus

  @IsNotEmpty()
    orderId: string
}
