import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum'

export class ListingDto {
  @IsNotEmpty()
  @MinLength(3)
  public listingName: string

  @IsNotEmpty()
  @Min(1)
  public listingPrice: number

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  public listingDesc: string

  @IsNotEmpty()
  @IsEnum(AvailableDate)
  public listingAvailableDate: AvailableDate

  @IsOptional()
  @IsArray()
  public listingPhoto: string[]
}
