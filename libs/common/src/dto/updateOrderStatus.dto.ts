import { OrderStatus } from '@app/common'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
    status: OrderStatus

  @IsNotEmpty()
    orderId: string

  @IsOptional()
  @IsBoolean()
    streamUpdates?: boolean
}

export class UpdateOrderStatusPaidRequestDto {
  @IsNotEmpty()
    status: OrderStatus

  @IsNotEmpty()
    orderId: string

  @IsNotEmpty()
    txRefId: string
}
