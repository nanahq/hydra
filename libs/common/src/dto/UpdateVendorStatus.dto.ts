import { IsNotEmpty, IsEnum } from 'class-validator'
import { VendorApprovalStatusEnum } from '@app/common/typings/VendorApprovalStatus.enum'

export class updateVendorStatus {
  @IsNotEmpty()
    id: string

  @IsEnum(VendorApprovalStatusEnum)
  @IsNotEmpty()
    status: string
}
