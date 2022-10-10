import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { nanoid } from 'nanoid'
import { FitRpcException } from '@app/common/filters/rpc.expection'
import { ListingDto } from '@app/common/database/dto/listing.dto'

@Injectable()
export class ListingServiceService {
  constructor (
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>
  ) {}

  async create (data: ListingDto): Promise<string> {
    const payload = {
      ...data,
      id: nanoid()
    }
    try {
      return await this.createListing(payload)
    } catch (error) {
      throw new FitRpcException(
        'Something went wrong. Could not add listing at the moment',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  private async createListing (listing: ListingDto): Promise<string> {
    const query = await this.listingRepository
      .createQueryBuilder('listing')
      .insert()
      .into(ListingEntity)
      .values({ ...listing })
      .returning('id')
      .execute()
    return query.identifiers[0].id as unknown as string
  }
}
