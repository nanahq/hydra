import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsPhoneNumber,
  ValidateNested,
  IsOptional
} from 'class-validator'
import { FleetOrderType, OrderPaymentType, OrderType } from '@app/common/typings/Global.Interface'
import { OrderOptions } from '@app/common/database/types/common'

class PreciseLocationDto {
  @IsArray()
  @IsNumber()
    coordinates: [number, number]

  type: 'Point'
}

class OrderBreakDownDto {
  @IsNumber()
    orderCost: number

  @IsNumber()
    systemFee: number

  @IsNumber()
    deliveryFee: number

  @IsNumber()
    vat: number
}

export class PlaceOrderDto {
  @IsString()
    user: string

  @IsString()
    vendor: string

  @IsArray()
    listing: string[]

  @IsArray()
    quantity: [
    {
      listing: string
      quantity: number
    },
  ]

  @IsNumber()
    totalOrderValue: number

  @IsString()
    orderType: OrderType

  @IsNumber()
    orderValuePayable: number

  @IsString()
    deliveryAddress: string

  @IsString()
  @IsOptional()
    specialNote: string

  @IsString()
    pickupAddress: string

  @IsPhoneNumber('NG', { message: 'Invalid Nigerian phone number' })
    primaryContact: string

  @IsBoolean()
    isThirdParty: boolean

  @ValidateNested()
  @IsObject()
    preciseLocation: PreciseLocationDto

  @ValidateNested()
  @IsObject()
    precisePickupLocation: PreciseLocationDto

  @IsArray()
    options: OrderOptions[]

  @IsString()
    orderDeliveryScheduledTime: string

  @ValidateNested()
  @IsObject()
    orderBreakDown: OrderBreakDownDto

  @IsOptional()
    thirdPartyName: string

  @IsOptional()
    coupon?: string

  @IsString()
    paymentType: OrderPaymentType

  @IsOptional()
    fleetOrderType?: FleetOrderType

  @IsString()
  @IsOptional()
    itemDescription?: string
}
