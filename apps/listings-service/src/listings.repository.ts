import { Injectable, Logger } from '@nestjs/common'
import {
  AbstractRepository,
  ListingOptionGroup,
  ListingCategory,
  ListingMenu,
  ScheduledListing
} from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class ListingMenuRepository extends AbstractRepository<ListingMenu> {
  protected readonly logger = new Logger(ListingMenuRepository.name)

  constructor (
  @InjectModel(ListingMenu.name) listingMenuModel: Model<ListingMenu>
  ) {
    super(listingMenuModel)
  }
}

@Injectable()
export class ListingOptionGroupRepository extends AbstractRepository<ListingOptionGroup> {
  protected readonly logger = new Logger(ListingOptionGroupRepository.name)

  constructor (
  @InjectModel(ListingOptionGroup.name)
    listingOptionGroupModel: Model<ListingOptionGroup>
  ) {
    super(listingOptionGroupModel)
  }
}

@Injectable()
export class ListingCategoryRepository extends AbstractRepository<ListingCategory> {
  protected readonly logger = new Logger(ListingCategoryRepository.name)

  constructor (
  @InjectModel(ListingCategory.name)
    listingCategoryModel: Model<ListingCategory>
  ) {
    super(listingCategoryModel)
  }
}

@Injectable()
export class ScheduledListingRepository extends AbstractRepository<ScheduledListing> {
  protected readonly logger = new Logger(ScheduledListing.name)

  constructor (
  @InjectModel(ScheduledListing.name)
    listingCategoryModel: Model<ScheduledListing>
  ) {
    super(listingCategoryModel)
  }
}
