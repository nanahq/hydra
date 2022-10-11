import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { FitRpcException } from '@app/common/filters/rpc.expection'
import { ListingDto } from '@app/common/database/dto/listing.dto'

@Injectable()
export class ListingsServiceService {
  constructor (
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>
  ) {}

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

  async create (data: ListingDto): Promise<string> {
    try {
      return await this.createListing(data)
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong. Could not add listing at the moment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async getListings (): Promise<ListingEntity[] | null> {
    return await this.listingRepository
      .createQueryBuilder('listings')
      .getMany()
  }

  private async createListing (listing: ListingDto): Promise<string> {
    const query = await this.listingRepository
      .createQueryBuilder('listings')
      .insert()
      .into(ListingEntity)
      .values({ ...listing })
      .returning('id')
      .execute()
    return query.identifiers[0].id as unknown as string
  }
}
