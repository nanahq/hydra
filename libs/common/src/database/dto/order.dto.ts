import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

import { OrderDeliveryMode } from '@app/common/typings/OrderDeliveryMode.enum';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  public listingId: string;

  @IsNotEmpty()
  @IsNumber()
  public totalOrderValue: number;

  @IsNotEmpty()
  @IsNumber()
  public orderValueToCharge: number;

  @IsNotEmpty()
  @IsEnum(OrderDeliveryMode)
  public deliveryMode: OrderDeliveryMode;

  @IsString()
  @IsNotEmpty()
  public deliveryAddress: string;

  @IsBoolean()
  @IsNotEmpty()
  public isThirdParty: boolean;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  public primaryContact: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('NG')
  public secondaryContact: string;

  @IsNotEmpty()
  @IsObject()
  public orderBreakDown: OrderBreakDown;

  @IsOptional()
  @IsArray()
  public customizableOptions: string[];

  @IsOptional()
  @IsArray()
  public addOns: string[];
}

export interface OrderBreakDown {
  orderCost: number;
  systemFee: number;
  deliveryFee: number;
  vat: number;
}
