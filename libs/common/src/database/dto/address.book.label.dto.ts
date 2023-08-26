import { MaxLength, MinLength } from 'class-validator'

export class AddressBookLabelDto {
  @MinLength(3)
  @MaxLength(1000)
    name: string

  desc?: string
}
