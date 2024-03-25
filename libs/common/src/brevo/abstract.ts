import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import SibApiV3Sdk from '@getbrevo/brevo'
import { CreateBrevoContact } from '@app/common/dto/brevo.dto'

@Injectable()
export class BrevoClient {
  private readonly client: SibApiV3Sdk.ContactsApi

  constructor (
    private readonly configService: ConfigService

  ) {
    const API_KEY = this.configService.get<string>('BREVO_API_KEY') ?? ''
    this.client = new SibApiV3Sdk.ContactsApi()
    this.client.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, API_KEY)
  }

  async createContact (payload: CreateBrevoContact): Promise<void> {
    try {
      await this.client.createContact(
        {
          email: payload.email,
          listIds: [5],
          attributes: {
            LASTNAME: payload.lastName,
            FIRSTNAME: payload.firstName,
            SMS: payload.phone,
            WHATSAPP: payload.phone,
            BUSINESS_NAME: payload.businessName
          }
        }
      )
    } catch (error) {
      throw new Error(error)
    }
  }
}
