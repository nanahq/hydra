import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'
import SibApiV3Sdk from '@getbrevo/brevo'
import { CreateBrevoContact } from '@app/common/dto/brevo.dto'

@Injectable()
export class BrevoClient {
  private readonly logger = new Logger()
  private readonly client: SibApiV3Sdk.ContactsApi

  constructor (
    private readonly configService: ConfigService

  ) {
    const API_KEY = this.configService.get<string>('BREVO_API_KEY') ?? ''
    this.client = new SibApiV3Sdk.ContactsApi()
    this.client.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, API_KEY)
  }

  async createContactVendor (payload: CreateBrevoContact, listId: number): Promise<void> {
    this.logger.log(`Creating a brevo contact ${JSON.stringify(payload)}`)
    try {
      await this.client.createContact(
        {
          email: payload.email,
          listIds: [listId],
          attributes: {
            LASTNAME: payload.lastName,
            FIRSTNAME: payload.firstName,
            SMS: payload.phone,
            WHATSAPP: payload.phone,
            BUSINESS_NAME: payload?.businessName
          }
        }
      )
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }

  async createContactUser (payload: CreateBrevoContact, listId: number): Promise<void> {
    this.logger.log(`Creating a brevo contact ${JSON.stringify(payload)}`)
    try {
      await this.client.createContact(
        {
          email: payload.email,
          listIds: [listId],
          attributes: {
            LASTNAME: payload.lastName,
            FIRSTNAME: payload.firstName,
            SMS: payload.phone,
            WHATSAPP: payload.phone
          }
        }
      )
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }
}