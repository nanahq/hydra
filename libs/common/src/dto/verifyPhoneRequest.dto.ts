import { IsNotEmpty, IsPhoneNumber } from 'class-validator'

export class verifyPhoneRequest {
  @IsNotEmpty()
  @IsPhoneNumber('NG')
    phone: string
}
