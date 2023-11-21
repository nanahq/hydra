import { IsBoolean, IsString } from 'class-validator'

export class CreateSubscriptionDto {
  @IsString()
    vendor: string
}

export class SubscribeDto extends CreateSubscriptionDto {
  @IsString()
    subscriberId: string
}

export class UpdateSubscriptionByVendorDto extends CreateSubscriptionDto {
  @IsBoolean()
    enabledByVendor: boolean
}
