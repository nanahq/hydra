import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ReasonDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  public reason: string
}
