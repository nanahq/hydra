import { IsNotEmpty, IsObject, IsOptional, IsPhoneNumber } from 'class-validator'
import { LocationCoordinates, PaymentInfo, VendorOperationSetting } from '@app/common/database/types/common'

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
    operation: VendorOperationSetting

  @IsObject()
    payment: PaymentInfo
}

export interface VendorI {
  firstName: string
  lastName: string
  email: string
  businessEmail: string
  password: string
  phone: string
  isValidated: boolean
  status: 'ONLINE' | 'OFFLINE'
  businessName: string
  businessLogo: string
  businessAddress: string
  location: {
    coordinates: [string, string]
  }
}

export interface VendorSettingsI {
  vendor: string
  operations: VendorOperationSetting
  payment?: PaymentInfo
}

export interface VendorUserI {
  isValidated: boolean
  status: 'ONLINE' | 'OFFLINE'
  businessName: string
  businessLogo: string
  businessAddress: string
  location: {
    coordinates: [string, string]
  }
}
