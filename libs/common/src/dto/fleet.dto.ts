import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class AcceptFleetInviteDto {
  @IsNotEmpty()
  @IsString()
    firstName: string

  @IsNotEmpty()
  @IsString()
    lastName: string

  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phone: string

  @IsNotEmpty()
    email: string

  @MinLength(8)
  @MaxLength(20)
    password: string

  @IsNotEmpty()
  @IsString()
    inviteLink: string
}

export class CreateAccountWithOrganizationDto {
  @IsNotEmpty()
  @IsString()
    firstName: string

  @IsNotEmpty()
  @IsString()
    lastName: string

  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phone: string

  @IsNotEmpty()
  @IsEmail()
    email: string

  @MinLength(8)
  @MaxLength(20)
    password: string

  @IsNotEmpty()
  @IsString()
    organization: string
}

export class UpdateFleetOwnershipStatusDto {
  @IsNotEmpty()
  @IsMongoId()
    memberId: string

  @IsNotEmpty()
  @IsBoolean()
    status: boolean
}
