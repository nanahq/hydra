import { ConfigService } from '@nestjs/config'
import * as  Flutterwave from 'flutterwave-node-v3'
import { BaseChargeRequest, isProductionEnv, UssdCharge } from '@app/common'
import { Injectable } from '@nestjs/common'
@Injectable()
export class FlutterwaveService {
  private readonly flw: any
  constructor (
    private readonly configService: ConfigService
  ) {
    const isProduction = isProductionEnv()
    const publicKey = isProduction
      ? this.configService.get('FLW_LIVE_KEY')
      : this.configService.get('FLW_TEST_KEY')

    const secretKey = isProduction
      ? this.configService.get('FLW_LIVE_SECRET')
      : this.configService.get('FLW_TEST_SECRET')

    this.flw = new Flutterwave(publicKey, secretKey)
  }

  async bankTransfer (details: BaseChargeRequest): Promise<any> {
    const results = await this.flw.Charge.bank_transfer(details) as any
    return results
  }

  async ussd (details: UssdCharge): Promise<any> {
    const results = await this.flw.Charge.ussd(details) as any
    return results
  }
}
