import { HttpStatus, Injectable } from '@nestjs/common'

import { FitRpcException, ResponseWithStatus, ServicePayload } from '@app/common'
import { AddressBookRepository } from './address.book.repository'
import { AddressBookDto } from '@app/common/database/dto/user/address.book.dto'
import { AddressBook } from '@app/common/database/schemas/address.book.schema'

@Injectable()
export class AddressBookService {
  constructor (
    private readonly repository: AddressBookRepository
  ) {
  }

  async list (): Promise<AddressBook[]> {
    const getRequest = await this.repository.find({ isDeleted: false })

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching address books.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async listByUserId (id: string): Promise<AddressBook[]> {
    const addresses = await this.repository.find({
      userId: id,
      isDeleted: false
    })

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
      console.log(id)
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
}
