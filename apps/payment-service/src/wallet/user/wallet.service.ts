import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  FitRpcException,
  internationalisePhoneNumber,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest
} from '@app/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'
import { PaystackInstancePayload } from '@app/common/dto/UpdateUserDto'

@Injectable()
export class UserWalletService {
  private readonly logger = new Logger(UserWalletService.name)
  private readonly PAYSTACK_CREATE_CUSTOMER_URL = 'https://api.paystack.co/customer'

  private readonly PAYSTACK_DEDICATED_ACCOUNT = 'https://api.paystack.co/dedicated_account'
  private readonly HEADERS: { ContentType: string, Authorization: string }

  constructor (

    private readonly httpService: HttpService,

    private readonly configService: ConfigService,

    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy

  ) {
    const paystackSecret = this.configService.get<string>('PAY_STACK_SECRET', '')
    this.HEADERS = {
      ContentType: 'application/json',
      Authorization: `Bearer ${paystackSecret}`
    }
  }

  public async createPaystackInstances (data: Omit<registerUserRequest, 'password'>): Promise<void> {
    this.logger.log(`[PIM] -> Creating customer on paystack for ${data.phone}`)

    let virtualAccountNumber: string | undefined

    const customerId = await this.createPaystackCustomerInstance(data)

    if (customerId !== undefined) {
      virtualAccountNumber = await this.createVirtualAccount(customerId)
    }

    await lastValueFrom(
      this.userClient.emit(QUEUE_MESSAGE.UPDATE_USER_PAYSTACK_INFO, { customerId, virtualAccountNumber, phone: internationalisePhoneNumber(data.phone) } satisfies PaystackInstancePayload)
    )
  }

  private async createPaystackCustomerInstance (payload: Omit<registerUserRequest, 'password'>): Promise<string | undefined> {
    this.logger.log(`[PIM] -> Creating customer on paystack for ${payload.phone}`)
    try {
      const phone = internationalisePhoneNumber(payload.phone)
      const { data } = await firstValueFrom(this.httpService.post(
        this.PAYSTACK_CREATE_CUSTOMER_URL,
        {
          email: payload.email,
          phone,
          first_name: payload.firstName,
          last_name: payload.lastName
        },
        {
          headers: this.HEADERS
        }
      ))

      if (data?.status === true) {
        return data?.data?.customer_code as string
      }

      return undefined
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not create a new customer on paystack',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private async createVirtualAccount (paystack_customer_id: string): Promise<string | undefined> {
    this.logger.log(`[PIM] -> Creating virtual account on paystack for ${paystack_customer_id}`)
    try {
      const { data } = await firstValueFrom(this.httpService.post(
        this.PAYSTACK_DEDICATED_ACCOUNT,
        {
          customer: paystack_customer_id,
          preferred_bank: 'titan-paystack'

        },
        {
          headers: this.HEADERS
        }
      ))

      if (data?.status === true) {
        return data?.data?.account_number
      }

      return undefined
    } catch (error) {
      this.logger.error(JSON.stringify(error))
      throw new FitRpcException(
        'Can not create a new virtual account a paystack on paystack',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}