import { IsEnum, IsNotEmpty, IsUUID, NotEquals } from 'class-validator'

import { OrderStatus } from '@app/common/typings/OrderStatus.enum'

export class UpdateOrderStatusRequestDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  @NotEquals(OrderStatus.FULFILLED)
  @NotEquals(OrderStatus.IN_ROUTE)
    status: OrderStatus

  @IsNotEmpty()
  @IsUUID(4)
    listingId: string
}
