import { MaxLength, MinLength } from 'class-validator'

export class AddressBookDto {
  @MinLength(8)
  @MaxLength(1000)
    address: string

  @MinLength(24)
  @MaxLength(24)
    labelId: string

  plot_number?: number

  house_number?: number

  coordinates: [string, string]
}
