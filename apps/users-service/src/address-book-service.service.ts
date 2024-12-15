import { HttpStatus, Injectable, Logger } from '@nestjs/common'

import {
  AddressBookI,
  FitRpcException,
  ResponseWithStatus,
  ServicePayload
} from '@app/common'
import { AddressBookRepository } from './address.book.repository'
import { AddressBookDto } from '@app/common/database/dto/user/address.book.dto'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class AddressBookService {
  private readonly logger = new Logger()
  constructor (private readonly repository: AddressBookRepository
  ) {}

  async list (): Promise<AddressBook[]> {
    const getRequest: AddressBook[] = await this.repository.findAndPopulate(
      { isDeleted: false },
      ['labelId']
    )

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching address books.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async listByUserId (id: string): Promise<AddressBook[]> {
    const addresses: AddressBook[] = await this.repository.findAndPopulate(
      {
        userId: id,
        isDeleted: false
      },
      ['labelId']
    )

    if (addresses === null) {
      throw new FitRpcException(
        'Something went wrong fetching address books.',
        HttpStatus.BAD_REQUEST
      )
    }
    return addresses
  }

  async create (dto: Partial<AddressBookDto>): Promise<ResponseWithStatus> {
    try {
      const pin = await this.generateUniquePIN()

      await this.repository.create({
        ...dto,
        pin
      })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'can not process request. Try again later',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async update ({
    data,
    userId
  }: ServicePayload<Partial<AddressBookDto>>): Promise<ResponseWithStatus> {
    try {
      await this.repository.findOneAndUpdate({ _id: userId }, { ...data })
      return { status: 1 }
    } catch {
      throw new FitRpcException(
        'Failed to update address book',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOne (id: string): Promise<AddressBook> {
    try {
      const book = await this.repository.findOne({
        _id: id,
        isDeleted: false
      })
      if (book === null) {
        throw new Error()
      }
      return book
    } catch (error) {
      throw new FitRpcException(
        'Such address book does not exists',
        HttpStatus.NOT_FOUND
      )
    }
  }

  async delete (id: string): Promise<ResponseWithStatus> {
    await this.repository.findOneAndUpdate({ _id: id }, { isDeleted: true })
    return { status: 1 }
  }

  async deleteByUser (id: string, userId: string): Promise<ResponseWithStatus> {
    await this.repository.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      { isDeleted: true }
    )

    return { status: 1 }
  }

  async getAddressByPin (pin: number): Promise<any> {
    const getAddress: AddressBookI = await this.repository.findOne({
      pin
    })

    return getAddress
  }

  async generateUniquePIN (): Promise<number> {
    function generatePin (): number {
      const digits = new Set<number>()
      while (digits.size < 5) {
        const randomDigit = Math.floor(Math.random() * 10)
        digits.add(randomDigit)
      }
      return Number(Array.from(digits).join(''))
    }

    while (true) {
      const pin = generatePin()
      const existingAddress = await this.repository.findOne({ pin })
      if (!existingAddress) {
        return pin
      }
    }
  }

  //   @Crons

  /**
   *
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateUsersWithAddressPin (): Promise<void> {
    try {
      const addresses = await this.repository.find(
        { pin: { $exists: false } }
      )
      for (const address of addresses) {
        await this.repository.findOneAndUpdate(
          { _id: address._id },
          {
            pin: await this.generateUniquePIN()
          }
        )
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error))
    }
  }
}
