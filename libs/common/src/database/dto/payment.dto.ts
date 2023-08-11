import { IsNotEmpty, IsString } from 'class-validator'

export class ChargeWithBankTransferDto {
    @IsString()
    @IsNotEmpty()
    public orderId: string
}
