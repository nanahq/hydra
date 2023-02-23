import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { verifyPhoneRequest } from './verifyPhoneRequest.dto';

export class PhoneVerificationPayload extends verifyPhoneRequest {
  @IsNotEmpty()
  @MaxLength(6)
  @MinLength(6)
  code: string;
}
