import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  MinLength
} from 'class-validator'

export class loginUserRequest {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phone: string

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string
}

export class LoginVendorRequest {
  @IsNotEmpty()
  @IsEmail()
    email: string

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
    password: string
}
