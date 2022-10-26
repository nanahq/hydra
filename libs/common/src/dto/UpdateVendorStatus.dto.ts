import { IsNotEmpty, IsEnum } from 'class-validator'
import { VendorApprovalStatusEnum } from '@app/common'

export class updateVendorStatus {
  @IsNotEmpty()
    id: string

  @IsEnum(VendorApprovalStatusEnum)
  @IsNotEmpty()
    status: string
}
