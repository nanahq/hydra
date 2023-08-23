import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { RegisterDriverDto } from '@app/common/dto/registerDriver.dto'
import { Driver, FitRpcException, ResponseWithStatus } from '@app/common'
import { DriverRepository } from './drivers-service.repository'
import * as bcrypt from 'bcryptjs'
import { internationalisePhoneNumber } from '@app/common/helpers/phone.number'

@Injectable()
export class DriversServiceService {
  private readonly logger = new Logger(DriversServiceService.name)

  constructor (
    private readonly driverRepository: DriverRepository
  ) {
  }

  public async register (payload: RegisterDriverDto): Promise<ResponseWithStatus> {
    payload.phone = internationalisePhoneNumber(payload.phone)
    const existingDriver = await this.driverRepository.findOne({ phone: payload.phone })

    if (existingDriver !== null) {
      throw new FitRpcException(
        'Driver already exists. Please log in to your account or reset your password',
        HttpStatus.CONFLICT
      )
    }

    try {
      const _driver: Partial<Driver> = {
        ...payload,
        password: await bcrypt.hash(payload.password, 10)
      }
      this.logger.log(`Registering a new driver with email: ${payload.email}`)

      await this.driverRepository.create(_driver)

      this.logger.log(`Driver ${payload.email} registered`)

      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to register driver ${payload.email} `,
        error
      })
      throw new FitRpcException('Can not register a new driver at the moment. Something went wrong.', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async getProfile (id: string): Promise<Driver> {
    try {
      const profile = await this.driverRepository.findOne({ _id: id })

      if (profile === null) {
        throw new Error('No profile with the given Id')
      }

      profile.password = ''
      return profile
    } catch (error) {
      this.logger.error({
        message: `Failed to fetch driver profile ${id} `,
        error
      })
      throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async deleteDriver (id: string): Promise<ResponseWithStatus> {
    try {
      await this.driverRepository.findOneAndUpdate({ _id: id }, { isDeleted: true })
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        message: `Failed to delete driver profile ${id} `,
        error
      })

      throw new FitRpcException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  public async validateDriver (phone: string, password: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({ phone }) as Driver | null

    if (driver === null) {
      this.logger.error({
        message: `Failed to validateVendor driver ${phone}. Driver does not exist `
      })

      throw new FitRpcException('Incorrect phone number', HttpStatus.NOT_FOUND)
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      driver.password
    )

    if (!isCorrectPassword) {
      this.logger.error({
        message: `Failed to validateVendor driver ${phone}. Password is incorrect `
      })

      throw new FitRpcException('Incorrect password', HttpStatus.UNAUTHORIZED)
    }

    driver.password = ''

    return driver
  }
}
