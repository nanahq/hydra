import { IsNotEmpty, IsString } from 'class-validator'

export class ChargeWithBankTransferDto {
    @IsString()
    @IsNotEmpty()
    public orderId: string
}

export class ChargeWithUssdDto extends ChargeWithBankTransferDto{
    @IsString()
    @IsNotEmpty()
    public account_bank: string

    @IsString()
    @IsNotEmpty()
    public account_number: string

}

