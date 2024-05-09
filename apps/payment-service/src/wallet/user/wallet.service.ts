import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  FitRpcException,
  internationalisePhoneNumber,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus
} from '@app/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'
import { PaystackInstancePayload } from '@app/common/dto/UpdateUserDto'
import { DebitUserWallet } from '@app/common/dto/General.dto'
import { UserWalletRepository } from './wallet.repository'
import { UserWallet } from '@app/common/database/schemas/user-wallet.schema'

@Injectable()
export class UserWalletService {
  private readonly logger = new Logger(UserWalletService.name)
  private readonly PAYSTACK_CREATE_CUSTOMER_URL =
    'https://api.paystack.co/customer'

  private readonly PAYSTACK_DEDICATED_ACCOUNT =
    'https://api.paystack.co/dedicated_account'

  private readonly HEADERS: { ContentType: string, Authorization: string }

  constructor (
    private readonly userWalletRepository: UserWalletRepository,

    private readonly httpService: HttpService,

    private readonly configService: ConfigService,

    @Inject(QUEUE_SERVICE.USERS_SERVICE)
    private readonly userClient: ClientProxy
  ) {
    const paystackSecret = this.configService.get<string>(
      'PAY_STACK_SECRET',
      ''
    )
    this.HEADERS = {
      ContentType: 'application/json',
      Authorization: `Bearer ${paystackSecret}`
    }
  }

  public async createPaystackInstances (
    payload: MultiPurposeServicePayload<Omit<registerUserRequest, 'password'>>
  ): Promise<void> {
    await this.userWalletRepository.create({ user: payload.id, balance: 0 })
    this.logger.log(`[PIM] -> Creating customer on paystack for ${payload.id}`)

    let virtualAccountNumber: string | undefined

    // TODO(@siradji) wrap createPaystackCustomerInstance in a try-catch
    const customerId = await this.createPaystackCustomerInstance(payload.data)

    if (customerId !== undefined) {
      virtualAccountNumber = await this.createVirtualAccount(customerId)
    }

    await lastValueFrom(
      this.userClient.emit(QUEUE_MESSAGE.UPDATE_USER_PAYSTACK_INFO, {
        customerId,
        virtualAccountNumber,
        phone: internationalisePhoneNumber(payload.data.phone)
      } satisfies PaystackInstancePayload)
    )
  }

  private async createPaystackCustomerInstance (
    payload: Omit<registerUserRequest, 'password'>
  ): Promise<string | undefined> {
    this.logger.log(
      `[PIM] -> Creating customer on paystack for ${payload.phone}`
    )
    try {
      const phone = internationalisePhoneNumber(payload.phone)
      const { data } = await firstValueFrom(
        this.httpService.post(
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
        )
      )

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
  private async createVirtualAccount (
    paystackCustomerId: string
  ): Promise<string | undefined> {
    this.logger.log(
      `[PIM] -> Creating virtual account on paystack for ${paystackCustomerId}`
    )
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          this.PAYSTACK_DEDICATED_ACCOUNT,
          {
            customer: paystackCustomerId,
            preferred_bank: 'titan-paystack'
          },
          {
            headers: this.HEADERS
          }
        )
      )

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

  public async debitUserWallet (payload: DebitUserWallet): Promise<ResponseWithStatus> {
    try {
      const wallet = await this.userWalletRepository.findOne({
        user: payload.user
      }) as UserWallet

      console.log(wallet)
      const sufficientFunds = this.balanceCheck(wallet.balance, payload.amountToDebit)

      if (!sufficientFunds) {
        return { status: 0 }
      }

      const newWalletBalance = Number(wallet.balance) - Number(payload.amountToDebit)
      await this.userWalletRepository.findOneAndUpdate(
        { user: payload.user },
        { balance: newWalletBalance }
      )

      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(error, HttpStatus.BAD_REQUEST)
    }
  }

  private balanceCheck (
    balance: number,
    amount: number
  ): boolean {
    return balance >= amount
  }
}
