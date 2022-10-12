import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { FitRpcException } from '@app/common/filters/rpc.expection'
import { ListingDto } from '@app/common/database/dto/listing.dto'
import { ResponseWithStatus } from '@app/common'

@Injectable()
export class ListingsServiceService {
  constructor (
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>
  ) {
  }

  async getAllListings (): Promise<ListingEntity[]> {
    const getRequest = await this.getListings()

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async create (vendorId: string, data: ListingDto): Promise<string> {
    try {
      return await this.createListing(vendorId, data)
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong. Could not add listing at the moment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async update (data: Partial<ListingEntity>): Promise<ResponseWithStatus> {
    const req = await this.updateListing(data)

    if (req === null) {
      throw new FitRpcException(
        'Failed to update listing',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  async getListing (condition: { listingId: string }): Promise<ListingEntity> {
    const _listing = await this.getListingById(condition.listingId)

    if (_listing === null) {
      throw new FitRpcException(
        'Listing with id is not found',
        HttpStatus.NOT_FOUND
      )
    }

    return _listing
  }

  async deleteListing (listingId: string): Promise<ResponseWithStatus> {
    const deleteRequest = await this.deleteListingById(listingId)

    if (deleteRequest === null) {
      throw new FitRpcException(
        'Failed to delete listing. Invalid ID',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    return { status: 1 }
  }

  private async getListingById (id: string): Promise<ListingEntity | null> {
    return await this.listingRepository
      .createQueryBuilder('listing')
      .where('id = :id', { id })
      .getOne()
  }

  private async getListings (): Promise<ListingEntity[] | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .getMany()
  }

  private async deleteListingById (id: string): Promise<DeleteResult | null> {
    return await this.listingRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute()
  }

  private async createListing (vendorId: string, listing: ListingDto): Promise<string> {
    const query = await this.listingRepository
      .createQueryBuilder('listings')
      .insert()
      .into(ListingEntity)
      .values({
        ...listing,
        vendorId
      })
      .returning('id')
      .execute()
    return query.identifiers[0].id as unknown as string
  }

  private async updateListing (data: Partial<ListingEntity>): Promise<UpdateResult | null> {
    const listingId = data.id
    delete data.id // remove ID to avoid changing it
    delete data.vendorId // remove vendor ID to avoid changing vendor

    return await this.listingRepository
      .createQueryBuilder()
      .update(ListingEntity)
      .set({
        ...data
      })
      .where('id = :id', { id: listingId })
      .returning('id')
      .execute()
  }
}
