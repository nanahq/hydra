import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsPhoneNumber, IsISO8601, ValidateNested } from 'class-validator'
import { OrderType } from '@app/common/typings/Global.Interface'

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

  @IsString()
    listing: string

  @IsString()
    quantity: string

  @IsNumber()
    totalOrderValue: number

  @IsString()
    orderType: OrderType

  @IsNumber()
    orderValuePayable: number

  @IsString()
    deliveryAddress: string

  @IsPhoneNumber('NG', { message: 'Invalid Nigerian phone number' })
    primaryContact: string

  @IsBoolean()
    isThirdParty: boolean

  @ValidateNested()
  @IsObject()
    preciseLocation: PreciseLocationDto

  @IsArray()
  @IsString()
    options: string[]

  @IsISO8601()
    orderDeliveryScheduledTime: string

  @ValidateNested()
  @IsObject()
    orderBreakDown: OrderBreakDownDto
}