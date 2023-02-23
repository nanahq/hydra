import { OrderStatus } from '@app/common';
import { IsEnum, IsNotEmpty, IsPhoneNumber, IsUUID } from 'class-validator';

export class OrderStatusUpdateDto {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsUUID(4)
  @IsNotEmpty()
  listingId: string;
}
