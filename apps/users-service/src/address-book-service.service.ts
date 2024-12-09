import { HttpStatus, Injectable } from '@nestjs/common'

import {
  AddressBookI,
  FitRpcException,
  PinAddressI,
  ResponseWithStatus,
  ServicePayload,
  UserI
} from '@app/common'
import { AddressBookRepository } from './address.book.repository'
import { AddressBookDto } from '@app/common/database/dto/user/address.book.dto'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'
import { UserRepository } from './users.repository'

@Injectable()
export class AddressBookService {
  constructor (private readonly repository: AddressBookRepository,
    private readonly usersRepository: UserRepository
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
      await this.repository.create(dto)
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

  async getAddressByPin (pin: number): Promise<PinAddressI> {
    try {
      const getUser: UserI = await this.usersRepository.findOne({
        addressPin: pin
      })

      const addresses: AddressBookI[] = await this.repository.findAndPopulate(
        {
          userId: getUser._id.toString(),
          isDeleted: false,
          shareable: true
        },
        ['labelId']
      )

      return {
        firstname: getUser.firstName,
        lastName: getUser.lastName,
        addresses
      }
    } catch (error) {
      throw new FitRpcException(
        'Your address pin is incorrect.',
        HttpStatus.NOT_FOUND
      )
    }
  }
}
