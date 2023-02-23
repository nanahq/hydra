import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class loginUserRequest {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phoneNumber: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}

export class LoginVendorRequest {
  @IsNotEmpty()
  @IsEmail()
  businessEmail: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
