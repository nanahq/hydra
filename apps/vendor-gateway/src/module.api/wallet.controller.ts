import { IRpcException, QUEUE_MESSAGE, QUEUE_SERVICE, Vendor, VendorPayout } from '@app/common'
import { Controller, Get, HttpException, Inject, Logger, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name)
  constructor (
    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('payouts')
  async getPayouts (@CurrentUser() vendor: Vendor): Promise<VendorPayout[]> {
    return await lastValueFrom<VendorPayout[]>(
      this.paymentClient.send(QUEUE_MESSAGE.WALLET_GET_PAYOUT_VENDOR, { vendorId: vendor._id })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async getPayoutOverview (@CurrentUser() vendor: Vendor): Promise<VendorPayout[]> {
    return await lastValueFrom<VendorPayout[]>(
      this.paymentClient.send(QUEUE_MESSAGE.WALLET_PAYOUT_OVERVIEW, { vendorId: vendor._id })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}