import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  Length,
  MaxLength,
  MinLength
} from 'class-validator'
import { DriverType } from '@app/common'
import { Transform } from 'class-transformer'

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

  @IsNotEmpty()
  @IsNumber()
  @Length(11, 11)
  @Transform(({ value }) => {
    return Number(value)
  })
    nin: number

  @IsString()
  @IsNotEmpty()
    type: DriverType
}
