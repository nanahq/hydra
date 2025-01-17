import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsBoolean,
  IsOptional,
  IsNumber
} from 'class-validator'
import { DriverType } from '@app/common'

export function IsExactly11Digits (validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isExactly11Digits',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate (value: any, args: ValidationArguments) {
          if (typeof value !== 'number') {
            return false
          }
          return value.toString().length === 11
        },
        defaultMessage (args: ValidationArguments) {
          return `${args.property} must be exactly 11 digits`
        }
      }
    })
  }
}

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

  @IsString()
  @IsNotEmpty()
    type: DriverType

  @IsBoolean()
    internal: boolean = false

  @IsOptional()
  @IsString()
    organization?: string

  @IsOptional()
  @IsNumber()
    nin?: number
}
