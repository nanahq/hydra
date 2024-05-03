import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import {
  BrevoClient,
  CheckUserAccountI,
  Coupon,
  FitRpcException,
  internationalisePhoneNumber,
  loginUserRequest,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  registerUserRequest,
  ResponseWithStatus,
  ServicePayload,
  TokenPayload,
  User,
  verifyPhoneRequest,
  UserI, IRpcException, UserStatI
} from '@app/common'
import { UserRepository } from './users.repository'
import {
  UpdateUserDto,
  PaystackInstancePayload
} from '@app/common/dto/UpdateUserDto'
import { catchError, EMPTY, lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'
import { CreateBrevoContact } from '@app/common/dto/brevo.dto'
import { ConfigService } from '@nestjs/config'
import { arrayParser } from '@app/common/utils/statsResultParser'

@Injectable()
export class UsersService {
  private readonly logger = new Logger()
  constructor (
    private readonly usersRepository: UserRepository,

    private readonly brevoClient: BrevoClient,

    private readonly configService: ConfigService,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,

    @Inject(QUEUE_SERVICE.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}

  async register ({
    email,
    phone,
    password,
    firstName,
    lastName
  }: registerUserRequest): Promise<User> {
    const formattedPhone = internationalisePhoneNumber(phone)
    await this.checkExistingUser(formattedPhone, email) // Gate to check if phone has already been registered

    const payload: Partial<User> = {
      email,
      phone: formattedPhone,
      password: await bcrypt.hash(password, 10),
      isValidated: false,
      lastName,
      firstName
    }

    const brevoPayload: CreateBrevoContact = {
      firstName,
      lastName,
      email,
      phone: formattedPhone
    }
    try {
      const user = await this.usersRepository.create(payload)

      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION, {
          email,
          phone,
          password
        })
          .pipe(
            catchError((error: IRpcException) => {
              this.logger.error(JSON.stringify(error))
              return EMPTY
            })
          )
      )

      if (this.configService.get<string>('NODE_ENV') === 'production') {
        const paystackInstancePayload: Omit<registerUserRequest, 'password'> = {
          email,
          phone: formattedPhone,
          firstName,
          lastName
        }

        this.logger.log(
          '[PIM] -> Account created. Emitting events for paystack instance creation'
        )
        await lastValueFrom(
          this.paymentClient.emit(
            QUEUE_MESSAGE.USER_WALLET_ACCOUNT_CREATED,
            paystackInstancePayload
          )
            .pipe(
              catchError((error: any) => {
                this.logger.error(JSON.stringify(error))
                return EMPTY
              })
            )
        )
      }

      await this.brevoClient.createContactUser(brevoPayload, 6)

      const slackMessage = `User ${user.firstName} ${user.lastName} signed up with phone number: ${user.phone}`
      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.SEND_SLACK_MESSAGE, { text: slackMessage })
      )

      return user
    } catch (error) {
      throw new FitRpcException(
        `can not process request. Try again later ${JSON.stringify(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async resendPhoneNumberRequest (phone: string): Promise<ResponseWithStatus> {
    const user: User | null = await this.usersRepository.findOne({ phone })

    if (user === null) {
      throw new FitRpcException(
        'User with that phone number does not exist',
        HttpStatus.NOT_FOUND
      )
    }

    // if (user.isValidated) {
    //   throw new FitRpcException('Phone number has been verified', HttpStatus.BAD_REQUEST)
    // }

    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION, {
        phone
      })
    )

    return { status: 1 }
  }

  async validateUser ({
    phone,
    password
  }: loginUserRequest): Promise<{ status: number, data: User }> {
    const validateUserRequest: User =
      await this.usersRepository.findOneAndPopulate({ phone }, ['coupons'])

    if (validateUserRequest === null) {
      throw new FitRpcException(
        'User with that phone number does not exist',
        HttpStatus.NOT_FOUND
      )
    }
    const isCorrectPassword: boolean = await bcrypt.compare(
      password,
      validateUserRequest.password
    )

    if (!isCorrectPassword) {
      throw new FitRpcException(
        'Provided Password is incorrect',
        HttpStatus.UNAUTHORIZED
      )
    }

    if (!validateUserRequest.isValidated) {
      await lastValueFrom(
        this.notificationClient.emit(QUEUE_MESSAGE.SEND_PHONE_VERIFICATION, {
          phone: validateUserRequest.phone
        })
      )
      throw new FitRpcException('Verify phone number', HttpStatus.FORBIDDEN)
    }

    validateUserRequest.password = ''
    return {
      status: 1,
      data: validateUserRequest
    }
  }

  async updateUserStatus ({ phone }: verifyPhoneRequest): Promise<User> {
    try {
      const user = await this.usersRepository.findOneAndUpdate(
        { phone },
        { isValidated: true }
      )

      return user
    } catch {
      throw new FitRpcException(
        'Failed to update user status',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateUserProfile ({
    data,
    userId
  }: ServicePayload<Partial<UpdateUserDto>>): Promise<ResponseWithStatus> {
    try {
      await this.usersRepository.findOneAndUpdate({ _id: userId }, { ...data })
      return { status: 1 }
    } catch (error) {
      this.logger.log({
        error,
        message: `PIM -> failed to update user ${userId}`
      })
      throw new FitRpcException(
        'Failed to update user profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getUser ({ userId }: TokenPayload): Promise<User> {
    try {
      const user = (await this.usersRepository.findOneAndPopulate(
        {
          _id: userId,
          isDeleted: false
        },
        ['coupons']
      )) as any
      if (user === null) {
        throw new Error('Can not find user')
      }
      user.password = ''
      return user
    } catch (error) {
      throw new FitRpcException(
        'Provided user id is not found',
        HttpStatus.UNAUTHORIZED
      )
    }
  }

  async getAllUsers (): Promise<UserI[]> {
    const getRequest = await this.usersRepository.findAndPopulate<UserI>(
      {},
      ['orders', 'coupons']
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all users.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async adminMetrics (): Promise<UserStatI> {
    const today = new Date()
    const week = new Date(today.getTime() - 168 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 1020 * 60 * 60 * 1000)

    const weekStart = new Date(week)
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(month)
    monthStart.setHours(0, 0, 0, 0)
    const [aggregateUsers, usersWithOrders, weeklySignup, monthlySignup] = await Promise.all([
      this.usersRepository.findRaw().aggregate([
        {
          $match: {
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 }
          }
        }
      ]),

      this.usersRepository.findRaw().aggregate([
        {
          $match: {
            orders: { $ne: [] }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 }
          }
        }
      ]),

      this.usersRepository.findRaw().countDocuments({
        createdAt: {
          $gte: weekStart.toISOString(),
          $lt: today.toISOString()
        }
      }),

      this.usersRepository.findRaw().countDocuments({
        createdAt: {
          $gte: monthStart.toISOString(),
          $lt: today.toISOString()
        }
      })

    ])

    return {
      aggregateUsers: arrayParser<number>(aggregateUsers, 'totalUsers'),
      usersWithOrders: arrayParser<number>(usersWithOrders, 'totalOrders'),
      weeklySignup,
      monthlySignup
    }
  }

  async deleteUserProfile (userId: string): Promise<ResponseWithStatus> {
    await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { isDeleted: true }
    )
    return { status: 1 }
  }

  public async getUserWithPhone (phone: string): Promise<User> {
    const _user = await this.usersRepository.findOne({
      phone,
      isDeleted: false
    })

    if (_user === null) {
      throw new FitRpcException(
        'User not with the phone number not found',
        HttpStatus.NOT_FOUND
      )
    }

    _user.password = ''
    return _user
  }

  public async updateUserOrderCount (
    orderId: string,
    userId: string
  ): Promise<ResponseWithStatus> {
    const user = (await this.usersRepository.findOne({ _id: userId })) as User
    await this.usersRepository.findOneAndUpdate(
      { _id: user?._id },
      { orders: [...user?.orders, orderId] }
    )
    return { status: 1 }
  }

  public async checkUserAccount (phone: string): Promise<CheckUserAccountI> {
    const user: User | null = await this.usersRepository.findOne({ phone })
    if (user === null) {
      return {
        hasAccount: false,
        firstName: undefined
      }
    }

    if (user.isDeleted) {
      await this.usersRepository.findAndUpdate(
        { _id: user._id },
        { isDeleted: false }
      )
    }

    return {
      hasAccount: true,
      firstName: user.firstName
    }
  }

  public async updateUserPaystackDetails (
    data: PaystackInstancePayload
  ): Promise<void> {
    this.logger.log(`[PIM] -> paystack instance received for ${data.phone}`)
    this.logger.log(JSON.stringify(data))
    await this.usersRepository.findOneAndUpdate(
      { phone: data.phone },
      {
        paystack_titan: data?.virtualAccountNumber,
        paystack_customer_id: data?.customerId
      }
    )
  }

  private async checkExistingUser (phone: string, email: string): Promise<User> {
    const _phone: User | null = await this.usersRepository.findOne({ phone })

    const _email: User | null = await this.usersRepository.findOne({ email })

    if (_phone !== null) {
      throw new FitRpcException(
        'Phone Number is  already registered.',
        HttpStatus.CONFLICT
      )
    }

    if (_email !== null) {
      throw new FitRpcException(
        'Email is  already registered.',
        HttpStatus.CONFLICT
      )
    }
    return _phone as unknown as User
  }

  public async accountRemovalRequest (data: { phone: string }): Promise<void> {
    await this.usersRepository.findOneAndUpdate(
      { phone: data.phone },
      { isDeleted: true }
    )
  }

  public async addUserCoupon ({
    data,
    userId
  }: ServicePayload<{ couponId: string }>): Promise<void> {
    try {
      const user = await this.usersRepository.findOne({ _id: userId })
      const existingCoupons = user?.coupons ?? []
      return await this.usersRepository.findOneAndUpdate(
        { _id: user._id },
        { coupons: [...existingCoupons, data.couponId] }
      )
    } catch (error) {
      this.logger.log(error)
      this.logger.log('Can not add coupon to user account')
    }
  }

  public async removeUserCoupon ({
    data,
    userId
  }: ServicePayload<{ couponCode: string }>): Promise<void> {
    try {
      const _coupon = await lastValueFrom<Coupon>(
        this.paymentClient.send(QUEUE_MESSAGE.GET_COUPON_BY_CODE, {
          code: data.couponCode
        })
      )

      const user = await this.usersRepository.findOne({ _id: userId })

      if (_coupon.useOnce) {
        const coupons = user?.coupons.filter(
          (coupon) => coupon.toString() !== _coupon._id.toString()
        )

        return await this.usersRepository.findOneAndUpdate(
          { _id: user._id },
          { coupons }
        )
      }
    } catch (error) {
      this.logger.log(error)
      this.logger.log('Can not add coupon to user account')
    }
  }
}
