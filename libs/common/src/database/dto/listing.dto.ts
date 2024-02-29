import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'

import { CustomisationOptionTypeEnum, ListingOption } from '@app/common'

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

  @IsNotEmpty()
    type: 'PRE_ORDER' | 'ON_DEMAND'

  @IsOptional()
  public menu?: string
}

export class UpdateListingCategoryDto {
  @IsOptional()
  public name?: string

  @IsArray()
  @IsOptional()
  public tags?: string[]

  @IsOptional()
    isLive?: boolean

  @IsOptional()
    isDeleted?: boolean

  @IsNotEmpty()
    catId?: string
}

export class CreateListingMenuDto {
  @IsNotEmpty()
  public name: string

  @IsNotEmpty()
  public price: string

  @IsNotEmpty()
  public serving: string

  @IsNotEmpty()
  public desc: string

  @IsOptional()
  public photo: string

  @IsNotEmpty()
  public isLive: string

  @IsNotEmpty()
  public isAvailable: string

  @IsNotEmpty()
  public optionGroups: string

  @IsNotEmpty()
  public categoryId: string
}

export class CreateOptionGroupDto {
  @IsNotEmpty()
  public name: string

  @IsNotEmpty()
  public min: number

  @IsNotEmpty()
    max: number

  @IsNotEmpty()
  @IsArray()
    options: ListingOption[]
}

export class UpdateOptionGroupDto {
  @IsOptional()
  public name?: string

  @IsOptional()
  public min?: number

  @IsOptional()
    max?: number

  @IsOptional()
    options?: ListingOption[]

  @IsNotEmpty()
    optionId?: string
}

export class CreateScheduledListingDto {
  @IsNotEmpty()
    listing: string

  @IsNumber()
    quantity: number

  @IsNotEmpty()
    availableDate: number
}

// Interfaces
