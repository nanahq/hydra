import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phoneNumber: string

  @MinLength(8)
  @MaxLength(20)
    password: string
}

export class UpdateUserDto {
  @IsOptional()
    firstName: string

  @IsOptional()

  @IsOptional()
    lastName: string

  @IsOptional()
    email: string

  @IsOptional()
    status: 'ONLINE' | 'OFFLINE'

  @IsOptional()
    location: {
    coordinates: [string, string]
  }
}

export interface UserI {
  phone: string
  firstName: string
  lastName: string
  email: string
  password: string
  location: {
    coordinates: [string, string]
  }
  isValidated: boolean
  createdAt: string
  updatedAt: string
  isDeleted: string
  status: 'ONLINE' | 'OFFLINE'
}
