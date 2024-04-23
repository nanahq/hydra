import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'
import * as SibApiV3Sdk from '@getbrevo/brevo'
import { CreateBrevoContact } from '@app/common/dto/brevo.dto'
import { HttpService } from '@nestjs/axios'
import { catchError, firstValueFrom, throwError } from 'rxjs'

@Injectable()
export class BrevoClient {
  private readonly logger = new Logger()

  private readonly BREVO_CONTACT_URL = 'https://api.brevo.com/v3/contacts'

  private readonly BREVO_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email'
  private readonly HEADERS: Record<string, string> = {}

  constructor (
    private readonly configService: ConfigService,
    private readonly httpsService: HttpService

  ) {
    const API_KEY = this.configService.get<string>('BREVO_API_KEY') ?? ''
    this.HEADERS = {
      accept: 'application/json',
      'api-key': API_KEY,
      'content-type': 'application/json'
    }
  }

  async createContactVendor (payload: CreateBrevoContact, listId: number): Promise<void> {
    this.logger.log(`Creating a brevo contact ${JSON.stringify(payload)}`)
    const data = {
      attributes: {
        FIRSTNAME: payload.firstName,
        LASTNAME: payload.lastName,
        SMS: payload.phone,
        BUSINESS_NAME: payload.businessName
      },
      updateEnabled: true,
      email: payload.email,
      listIds: [listId]
    }
    try {
      await firstValueFrom(
        this.httpsService.post(this.BREVO_CONTACT_URL, data, { headers: this.HEADERS })
          .pipe(catchError((error: any): any => {
            return throwError(error)
          }))
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async createContactUser (payload: CreateBrevoContact, listId: number): Promise<void> {
    this.logger.log(`Creating a brevo contact ${JSON.stringify(payload)}`)
    const data = {
      attributes: {
        FIRSTNAME: payload.firstName,
        LASTNAME: payload.lastName,
        SMS: payload.phone
      },
      updateEnabled: true,
      email: payload.email,
      listIds: [listId]
    }
    try {
      await firstValueFrom(
        this.httpsService.post(this.BREVO_CONTACT_URL, data, { headers: this.HEADERS })
          .pipe(catchError((error: any): any => {
            return throwError(error)
          }))
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async sendVendorPayoutEmail (emailPayload: SibApiV3Sdk.SendSmtpEmail): Promise<void> {
    try {
      await firstValueFrom(
        this.httpsService.post(this.BREVO_EMAIL_URL, emailPayload, { headers: this.HEADERS })
          .pipe(catchError((error: any): any => {
            console.error(error)
          }))
      )
      return undefined as any
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }
}
