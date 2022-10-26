import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength
} from 'class-validator'

import { AvailableDate, CustomisationOptionTypeEnum } from '@app/common'

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

  @IsArray()
  @IsOptional()
  public customisableOptions: ListingOptionEntityDto[]
}

export class ListingOptionEntityDto {
  @IsNotEmpty()
  @IsString()
  public optionName: string

  @IsNotEmpty()
  @IsString()
  public optionCost: string

  @IsNotEmpty()
  @IsEnum(CustomisationOptionTypeEnum)
  public optionType: CustomisationOptionTypeEnum
}
