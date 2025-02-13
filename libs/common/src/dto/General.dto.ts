import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator'
import { WalletTransactionStatus, WalletTransactionType } from '@app/common'

export class UpdateVendorReviewDto {
  @IsNotEmpty()
    vendor: string

  @IsString()
    reviewId: string
}
export class updateIsDriverInternalDto {
  @IsNotEmpty()
  @IsString()
    id: string

  @IsNotEmpty()
  @IsBoolean()
    internal: boolean
}

export class CreditWallet {
  @IsNotEmpty()
  @IsNumber()
    amount: number

  @IsNotEmpty()
  @IsString()
    driver: string

  @IsBoolean()
    withTransaction: boolean

  @IsString()
  @IsOptional()
    transaction?: string

  @IsString()
  @IsOptional()
    status?: WalletTransactionStatus
}

export class DebitWallet {
  @IsNotEmpty()
  @IsNumber()
    amount: number

  @IsNotEmpty()
  @IsString()
    driver: string

  @IsBoolean()
    withTransaction: boolean

  @IsString()
  @IsOptional()
    transaction?: string

  @IsString()
  @IsOptional()
    status?: WalletTransactionStatus
}

export class DebitUserWallet {
  @IsNotEmpty()
  @IsString()
    user: string

  @IsNotEmpty()
  @IsNumber()
    amountToDebit: number
}

export class createTransaction {
  @IsNotEmpty()
  @IsNumber()
    amount: number

  @IsNotEmpty()
  @IsString()
    driver: string

  @IsString()
  @IsOptional()
    transaction?: string

  @IsString()
  @IsOptional()
    type: WalletTransactionType

  @IsString()
  @IsOptional()
    status?: WalletTransactionStatus
}

export class UpdateTransaction {
  txId: string
  driverId: string
  status: WalletTransactionStatus
}
