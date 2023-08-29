import { MockModel } from '@app/common/database/test/support/mock.model'
import { ListingCategory, ListingMenu, ListingOptionGroup } from '@app/common'
import {
  ListingCategoryStub,
  ListingMenuStub,
  ListingOptionStub
} from '../stubs/Listings.stub'

export class ListingMenuModel extends MockModel<ListingMenu> {
  protected entityStub = ListingMenuStub()
}

export class ListingCategoryModel extends MockModel<ListingCategory> {
  protected entityStub = ListingCategoryStub()
}

export class ListingGroupOptionModel extends MockModel<ListingOptionGroup> {
  protected entityStub = ListingOptionStub()
}
