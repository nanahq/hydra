import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  MinLength
} from 'class-validator'

export class UserDto {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phoneNumber: string

  @MinLength(8)
  @MaxLength(20)
    password: string

  firstName: string

  lastName: string

  state: string

  @IsInt()
    status: number

  @IsArray()
    addresses: string[]
}
