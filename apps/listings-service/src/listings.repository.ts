import { Repository } from 'typeorm'
import { ListingEntity } from '@app/common/database/entities/Listing'
import { ListingDto } from '@app/common/database/dto/listing.dto'

export class ListingsRepository extends Repository<ListingEntity> {
  public async createListing (listing: ListingDto): Promise<string> {
    const query = await this.createQueryBuilder('listings')
      .insert()
      .into(ListingEntity)
      .values({ ...listing })
      .returning('id')
      .execute()
    return query as unknown as string
  }
}
