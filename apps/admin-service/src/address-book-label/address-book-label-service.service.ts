import { HttpStatus, Injectable } from '@nestjs/common'

import {
  FitRpcException,
  ResponseWithStatus,
  ServicePayload
} from '@app/common'
import { AddressBookLabelRepository } from './address.book.label.repository'
import { AddressBookLabel } from '@app/common/database/schemas/address.book.label.schema'
import { AddressBookLabelDto } from '@app/common/database/dto/address.book.label.dto'

@Injectable()
export class AddressBookLabelService {
  constructor (private readonly repository: AddressBookLabelRepository) {}

  async list (): Promise<AddressBookLabel[]> {
    const getRequest = await this.repository.find({ isDeleted: false })

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching address book labels.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async create (
    createdBy: string,
    dto: AddressBookLabelDto
  ): Promise<ResponseWithStatus> {
    try {
      const data = {
        ...dto,
        createdBy
      }

      await this.repository.create(data)
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
  }: ServicePayload<
  Partial<AddressBookLabelDto>
  >): Promise<ResponseWithStatus> {
    try {
      await this.repository.findOneAndUpdate({ _id: userId }, { ...data })
      return { status: 1 }
    } catch {
      throw new FitRpcException(
        'Failed to update address book label',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOne (id: string): Promise<AddressBookLabel> {
    try {
      const label = await this.repository.findOne({
        _id: id,
        isDeleted: false
      })

      if (label === null) {
        throw new Error()
      }

      return label
    } catch (error) {
      throw new FitRpcException(
        'Such address book label does not exists',
        HttpStatus.NOT_FOUND
      )
    }
  }

  async delete (id: string): Promise<ResponseWithStatus> {
    await this.repository.findOneAndUpdate({ _id: id }, { isDeleted: true })
    return { status: 1 }
  }
}
