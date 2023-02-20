import {
  IsArray, IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength
} from 'class-validator'

import { CustomisationOptionTypeEnum } from '@app/common'
import { AvailableDate } from '@app/common/typings/AvailableDatesEnum.enum'
import { ListingOption } from '@app/common/database/types/common'

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

export class CreateListingCategoryDto {
  @IsNotEmpty()
  public name: string

  @IsArray()
  @IsNotEmpty()
  public tags: string[]

  @IsBoolean()
  @IsNotEmpty()
    isLive: boolean
}

export class CreateListingMenuDto {
  @IsNotEmpty()
  public name: string

  @IsNotEmpty()
  public price: string

  @IsNotEmpty()
  public serving

  @IsNotEmpty()
  public photo: string

  @IsNotEmpty()
  @IsBoolean()
  public isLive: boolean

  @IsNotEmpty()
  @IsBoolean()
  public isAvailable: boolean

  @IsNotEmpty()
  public category: string

  @IsNotEmpty()
  public optionGroups: string[]
}

export class CreateOptionGroupDto {
  @IsNotEmpty()
  public name: string

  @IsNotEmpty()
  public min: number

  @IsNotEmpty()
    max: number

  @IsNotEmpty()
    options: ListingOption[]
}

// Interfaces

export interface ListingCategoryI {
  name: string
  tags: string[]
  isLive: boolean
}

export interface ListingOptionGroupI {
  name: string
  min: number
  max: number
  options: ListingOption[]
}
