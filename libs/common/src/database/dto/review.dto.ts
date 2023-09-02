import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ReviewDto {
  @IsNotEmpty()
  public listingId: string

  @IsNotEmpty()
  public orderId: string

  @IsString()
  @IsNotEmpty()
  public reviewBody: string

  @IsNotEmpty()
  public vendorId: string

  @IsNumber()
  @IsNotEmpty()
  public reviewStars: number
}
