import { IsNotEmpty, IsString } from 'class-validator'

export class verifyTermiiToken {
  @IsNotEmpty()
  @IsString()
    pinId: string

  @IsNotEmpty()
  @IsString()
    pin: string
}
