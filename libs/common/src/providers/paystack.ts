import { ConfigService } from '@nestjs/config'
import {
  FitRpcException,
  PAYSTACK_URLS,
  PaystackCharge,
  PaystackChargeResponse, TransactionVerificationResponse
} from '@app/common'
import { HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class PaystackService {
  private readonly HEADERS: { Authorization: string, ContentType: string }

  constructor (
    private readonly configService: ConfigService,
    private readonly httpService: HttpService

  ) {
    const paystackSecret = configService.get<string>('PAY_STACK_SECRET', '')
    this.HEADERS = {
      ContentType: 'application/json',
      Authorization: `Bearer ${paystackSecret}`
    }
  }

  async initiateCharge (payload: PaystackCharge): Promise<PaystackChargeResponse> {
    try {
      const { data } = await firstValueFrom(this.httpService.post<PaystackChargeResponse>(`https://api.paystack.co/${PAYSTACK_URLS.INITIATE_CHARGE}`, payload, { headers: this.HEADERS }))
      return data
    } catch (error) {
      console.error(error?.message)
      throw new FitRpcException('Can not initiate paystack charge', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async verify (refId: string): Promise<TransactionVerificationResponse> {
    try {
      const { data } = await firstValueFrom(this.httpService.get(`https://api.paystack.co/${PAYSTACK_URLS.VERIFY_TRANSACTION}/${refId}`, { headers: this.HEADERS }))
      return data as TransactionVerificationResponse
    } catch (error) {
      console.error(error?.message)
      throw new FitRpcException('Can not verify paystack transaction', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
