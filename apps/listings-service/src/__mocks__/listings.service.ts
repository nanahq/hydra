import {
  ListingMenuStub,
  resStub,
  ListingCategoryStub,
  ListingOptionStub
} from '../test/stubs/Listings.stub'

export const ListingsService = jest.fn().mockReturnValue({
  createListingMenu: jest.fn().mockResolvedValue(resStub()),
  getAllListingMenu: jest.fn().mockResolvedValue([ListingMenuStub()]),
  getSingleListingMenu: jest.fn().mockResolvedValue(ListingMenuStub()),
  createListingCategory: jest.fn().mockResolvedValue(resStub()),
  getSingleListingCat: jest.fn().mockResolvedValue(ListingCategoryStub()),
  getAllCatVendor: jest.fn().mockResolvedValue([ListingCategoryStub()]),
  updateListingCat: jest.fn().mockResolvedValue(resStub()),
  createListingOptionGroup: jest.fn().mockResolvedValue(resStub()),
  getSingleListingOption: jest.fn().mockResolvedValue(ListingOptionStub()),
  updateListingOption: jest.fn().mockResolvedValue(resStub()),
  getAllListingOptionsVendor: jest
    .fn()
    .mockResolvedValue([ListingOptionStub()]),
  updateListingMenu: jest.fn().mockResolvedValue(resStub())
})
