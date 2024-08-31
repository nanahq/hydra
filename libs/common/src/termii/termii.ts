import { ConfigService } from '@nestjs/config'
import {
  FitRpcException
} from '@app/common'
import { HttpStatus, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { TERMII_URLS, TermiiPayload, TermiiResponse, TermiiVerificationPayload, TermiiVerificationResponse } from '../typings/Termii'

@Injectable()
export class TermiiService {
  private readonly HEADERS: { Authorization: string, ContentType: string }

  constructor (
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  async sendSMSToken (
    payload: TermiiPayload
  ): Promise<TermiiResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TermiiResponse>(
          `https://v3.api.termii.com/${TERMII_URLS.SEND_TOKEN}`,
          payload
        )
      )

      return data
    } catch (error) {
      console.error(error?.message)
      throw new FitRpcException(
        'Can not initiate Termii sms token.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async verifySMSToken (
    payload: TermiiVerificationPayload
  ): Promise<TermiiVerificationResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TermiiVerificationResponse>(
          `https://v3.api.termii.com/${TERMII_URLS.VERIFY_TOKEN}`,
          payload
        )
      )

      return data
    } catch (error) {
      console.error(error?.message)
      throw new FitRpcException(
        'Can not verify Termii sms token.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
