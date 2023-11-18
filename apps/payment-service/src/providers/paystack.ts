import { ConfigService } from '@nestjs/config'
import {
  FitRpcException,
  PAYSTACK_URLS,
  PaystackCharge,
  PaystackChargeResponse,
  PaystackChargeResponseData
} from '@app/common'
import { HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class PaystackService {
  private readonly httpService: HttpService

  private readonly HEADERS: { Authorization: string, ContentType: string }

  constructor (private readonly configService: ConfigService) {
    const paystackSecret = configService.get<string>('PAY_STACK_SECRET', '')
    this.HEADERS = {
      ContentType: 'application/json',
      Authorization: `Bearer ${paystackSecret}`
    }
  }

  async initiateCharge (payload: PaystackCharge): Promise<PaystackChargeResponseData> {
    try {
      const { data } = await firstValueFrom(this.httpService.post<PaystackChargeResponse>(`https://api.paystack.co/${PAYSTACK_URLS.INITIATE_CHARGE}`, payload, { headers: this.HEADERS }))
      return data.data
    } catch (error) {
      console.error(error)
      throw new FitRpcException('Can not initiate paystack charge', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
