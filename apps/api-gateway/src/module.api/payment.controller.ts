import { Body, Controller, HttpException, Inject, Post, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { BankTransferAccountDetails, IRpcException, QUEUE_MESSAGE, QUEUE_SERVICE, User } from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ChargeWithBankTransferDto } from '@app/common/database/dto/payment.dto'
import { catchError, lastValueFrom } from 'rxjs'
import { CurrentUser } from './current-user.decorator'

@Controller('payment')
export class PaymentController {
    constructor (
        @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
        private readonly paymentClient: ClientProxy
    ) {
    }

    @Post("charge/bank-transfer")
    @UseGuards(JwtAuthGuard)
    async chargeWithBankTransfer (
        @Body() data: ChargeWithBankTransferDto,
        @CurrentUser() user: User
    ) {
        return await lastValueFrom<BankTransferAccountDetails>(
            this.paymentClient.send(QUEUE_MESSAGE.CHARGE_BANK_TRANSFER, {...data, userId: user._id}).pipe(
                catchError((error: IRpcException) => {
                    throw new HttpException(error.message, error.status)
                })
            )
        )
    }
}
