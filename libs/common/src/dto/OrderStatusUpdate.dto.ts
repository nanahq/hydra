import { OrderStatus } from '@app/common'
import { IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator'

export class OrderStatusUpdateDto {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phoneNumber: string

  @IsEnum(OrderStatus)
  @IsNotEmpty()
    status: OrderStatus
}
