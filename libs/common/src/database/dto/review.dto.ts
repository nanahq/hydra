import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ReviewDto {
  @IsNotEmpty()
  public listing: string

  @IsNotEmpty()
  public order: string

  @IsString()
  @IsNotEmpty()
  public reviewBody: string

  @IsNotEmpty()
  public vendor: string

  @IsNumber()
  @IsNotEmpty()
  public reviewStars: number
}
