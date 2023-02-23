import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, ListingOptionGroup, ListingCategory, ListingMenu } from '@app/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'

@Injectable()
export class ListingMenuRepository extends AbstractRepository<ListingMenu> {
  protected readonly logger = new Logger(ListingMenuRepository.name)

  constructor (
  @InjectModel(ListingMenu.name) listingMenuModel: Model<ListingMenu>,
    @InjectConnection() connection: Connection
  ) {
    super(listingMenuModel, connection)
  }
}

@Injectable()
export class ListingOptionGroupRepository extends AbstractRepository<ListingOptionGroup> {
  protected readonly logger = new Logger(ListingOptionGroupRepository.name)

  constructor (
  @InjectModel(ListingOptionGroup.name)
    listingOptionGroupModel: Model<ListingOptionGroup>,
    @InjectConnection() connection: Connection
  ) {
    super(listingOptionGroupModel, connection)
  }
}

@Injectable()
export class ListingCategoryRepository extends AbstractRepository<ListingCategory> {
  protected readonly logger = new Logger(ListingCategoryRepository.name)

  constructor (
  @InjectModel(ListingCategory.name)
    listingCategoryModel: Model<ListingCategory>,
    @InjectConnection() connection: Connection
  ) {
    super(listingCategoryModel, connection)
  }
}
