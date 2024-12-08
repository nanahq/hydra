import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class AddressBookDto {
  @MinLength(8)
  @MaxLength(1000)
    address: string

  @MinLength(24)
  @MaxLength(24)
    labelId: string

  @IsOptional()
    plot_number?: string

  house_number?: string

  @IsString()
    labelName: string

  @IsOptional()
    coordinates: [string, string]

  @IsString()
    street_address: string
}
