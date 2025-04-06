import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class registerUserRequest {
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
  @IsEmail()
    email: string

  @IsNotEmpty()
  @IsString()
    firstName: string

  @IsNotEmpty()
  @IsString()
    lastName: string

  @IsOptional()
  @IsString()
    referedBy: string
}

export class registerUserWallet extends registerUserRequest {
  @IsNotEmpty()
  @IsString()
    user: string
}
