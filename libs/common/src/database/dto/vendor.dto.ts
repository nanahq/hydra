import { VendorApprovalStatusEnum } from '@app/common/typings/VendorApprovalStatus.enum'
import { IsNotEmpty } from 'class-validator'

export class VendorDto {
  @IsNotEmpty()
  public firstName: string

  @IsNotEmpty()
  public lastName: string

  @IsNotEmpty()
  public businessPhoneNumber: string

  @IsNotEmpty()
  public businessName: string

  public settlementBankName: string // not required for registration
  public settlementBankAccountName: string // not required for registration
  public approvalStatus: VendorApprovalStatusEnum // VendorApprovalStatus.PENDING is default
  @IsNotEmpty()
  public address: string

  @IsNotEmpty()
  public email: string

  @IsNotEmpty()
  public password: string
}