import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class RegisterDriverDto {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phone: string

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string

  @IsString()
  @IsNotEmpty()
    firstName: string

  @IsString()
  @IsNotEmpty()
    lastName: string

  @IsString()
  @IsNotEmpty()
    state: string

  @IsEmail()
  @IsNotEmpty()
    email: string
}
