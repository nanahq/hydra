import { IsArray, IsEmpty, IsEnum, IsNotEmpty } from 'class-validator'
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum'
import { CustomOptions } from '@app/common/typings/Custom.Interface'

export class ListingDto {
  @IsNotEmpty()
  public listingName: string

  @IsNotEmpty()
  public listingPrice: number

  @IsNotEmpty()
  public vendorId: string

  @IsNotEmpty()
  public listingDesc: string

  @IsNotEmpty()
  @IsEnum(AvailableDate)
  public listingAvailableDate: AvailableDate

  @IsEmpty()
  @IsArray()
  public customisableOptions: CustomOptions[]

  @IsNotEmpty()
  @IsArray()
  public listingPhoto: string[]
}
