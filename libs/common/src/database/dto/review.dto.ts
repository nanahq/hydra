import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator'

export class ReviewDto {
  @IsUUID(4)
  @IsNotEmpty()
  public listingId: string

  @IsUUID(4)
  @IsNotEmpty()
  public orderId: string

  @IsString()
  @IsNotEmpty()
  public reviewBody: string

  @IsUUID(4)
  @IsNotEmpty()
  public vendorId: string

  @IsNumber()
  @IsNotEmpty()
  public reviewStars: number
}