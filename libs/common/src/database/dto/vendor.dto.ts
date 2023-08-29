import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber
} from 'class-validator'
import {
  LocationCoordinates,
  PaymentInfo,
  VendorOperationSetting
} from '@app/common'

export class CreateVendorDto {
  @IsNotEmpty()
  public firstName: string

  @IsNotEmpty()
  public lastName: string

  @IsNotEmpty()
  public businessEmail: string

  @IsNotEmpty()
  public businessName: string

  @IsNotEmpty()
  public businessAddress: string

  @IsNotEmpty()
  public email: string

  @IsNotEmpty()
  @IsPhoneNumber('NG')
  public phone: string

  @IsNotEmpty()
  public password: string
}

export class UpdateVendorProfileDto {
  @IsOptional()
  public status: 'ONLINE' | 'OFFLINE'

  @IsOptional()
  public firstName: string

  @IsOptional()
  public lastName: string

  @IsOptional()
  public businessEmail: string

  @IsOptional()
  public businessName: string

  @IsOptional()
  public businessAddress: string

  @IsOptional()
  public businessLogo: string

  @IsOptional()
  public email: string

  @IsOptional()
  @IsPhoneNumber('NG')
  public phone: string

  @IsOptional()
  public password: string

  @IsOptional()
    location: LocationCoordinates
}

export class UpdateVendorSettingsDto {
  @IsObject()
  @IsOptional()
    operation?: VendorOperationSetting

  @IsObject()
  @IsOptional()
    payment?: PaymentInfo
}
