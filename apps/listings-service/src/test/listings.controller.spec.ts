import { Test } from '@nestjs/testing'
import { ListingsService } from '../listings.service'
import { ListingsController } from '../listings.controller'
import {
  ListingCategory,
  ListingMenu,
  ListingOptionGroup,
  ResponseWithStatus,
  RmqService,
  ServicePayload
} from '@app/common'
import { RmqContext } from '@nestjs/microservices'
import {
  ListingCategoryStub,
  ListingMenuStub,
  ListingOptionStub,
  resStub
} from './stubs/Listings.stub'
import {
  CreateListingCategoryDto,
  CreateListingMenuDto,
  CreateOptionGroupDto,
  UpdateListingCategoryDto,
  UpdateOptionGroupDto
} from '@app/common/database/dto/listing.dto'
import { VendorStub } from '../../../vendors-service/src/test/stubs/vendor.stub'

export const RmqServiceMock = {
  ack: jest.fn()
}

jest.mock('../listings.service.ts')

describe('listingsController', () => {
  let listingsController: ListingsController
  let listingsService: ListingsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ListingsController],
      providers: [ListingsService, RmqService]
    })
      .overrideProvider(RmqService)
      .useValue(RmqServiceMock)
      .compile()

    listingsController = moduleRef.get<ListingsController>(ListingsController)
    listingsService = moduleRef.get<ListingsService>(ListingsService)
    jest.clearAllMocks()
  })

  describe('getAllListings', () => {
    describe('When getting all vendors', () => {
      let response: ListingMenu[]
      let payload: ServicePayload<null>
      let context: RmqContext
      beforeEach(async () => {
        payload = {
          userId: ListingMenuStub()._id as any,
          data: null
        }

        response = await listingsController.getAllListings(payload, context)
      })
      test('then it should call listingsService.getAllListingMenu', () => {
        expect(listingsService.getAllListingMenu).toBeCalledWith(
          payload.userId
        )
      })

      test('then is should return all listings related to vendor', () => {
        expect(response).toStrictEqual([ListingMenuStub()])
      })
    })
  })

  describe('createListing', () => {
    describe('when creating a new listing', () => {
      let response: ResponseWithStatus
      let listing: ServicePayload<CreateListingMenuDto>
      let context: RmqContext

      beforeEach(async () => {
        listing = {
          userId: ListingMenuStub()._id as any,
          data: {
            categoryId: '63f7f2d0a0f1d5158f43cb7b',
            name: 'Chicken Wing',
            desc: 'A chicken cooked in marinated soy sauce',
            price: '2500',
            serving: 'per plate',
            photo:
              'https://storage.googleapis.com/eatlater_vendors_bucket/a.png',
            isLive: 'true',
            isAvailable: 'true',
            optionGroups: '63f93c3a248f6c43d0b764f7'
          }
        }
        response = await listingsController.createListingMenu(listing, context)
      })
      test('then it should call ListingsService.createListingMenu', () => {
        expect(listingsService.createListingMenu).toHaveBeenCalledWith(listing)
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('getListingMenu', () => {
    describe('when a listing menu', () => {
      let response: ListingMenu
      let payload: ServicePayload<string>
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          userId: '',
          data: ListingMenuStub()._id as any
        }

        response = await listingsController.getListingMenu(payload, context)
      })
      test('then it should call ListingsService.getSingleListingMenu', () => {
        expect(listingsService.getSingleListingMenu).toHaveBeenCalledWith(
          payload
        )
      })

      test('then it should return a single menu', () => {
        expect(response).toStrictEqual(ListingMenuStub())
      })
    })
  })

  describe('createListingCategory', () => {
    describe('when a creating a new category', () => {
      let response: ResponseWithStatus
      let payload: ServicePayload<CreateListingCategoryDto>
      let context: RmqContext

      beforeEach(async () => {
        payload = {
          userId: VendorStub()._id as any,
          data: {
            name: 'Japanese Food',
            tags: ['african', 'lunch'],
            isLive: true
          }
        }
        response = await listingsController.createListingCategory(
          payload,
          context
        )
      })
      test('then it should call listingService.createListingCategory', () => {
        expect(listingsService.createListingCategory).toHaveBeenCalledWith(
          payload
        )
      })

      test('then it should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('getSingleListingCat', () => {
    describe('When getting a vendor by ID', () => {
      let response: ListingCategory
      let catId: ServicePayload<string>
      let context: RmqContext

      beforeEach(async () => {
        catId = {
          userId: VendorStub()._id as any,
          data: ListingCategoryStub()._id as any
        }
        response = await listingsController.getSingleListingCat(catId, context)
      })
      test('then it should call listingService.getSingleListingCat', () => {
        expect(listingsService.getSingleListingCat).toHaveBeenCalledWith(catId)
      })

      test('then it should return a category', () => {
        expect(response).toStrictEqual(ListingCategoryStub())
      })
    })
  })

  describe('getAllCatVendor', () => {
    describe('When  getting all vendors category', () => {
      let response: ListingCategory[]
      let data: ServicePayload<null>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorStub()._id as any,
          data: null
        }
        response = await listingsController.getAllCatVendor(data, context)
      })
      test('then it should call listingService.getAllCatVendor', () => {
        expect(listingsService.getAllCatVendor).toHaveBeenCalledWith(
          data.userId
        )
      })

      test('then it should return all category', () => {
        expect(response).toStrictEqual([ListingCategoryStub()])
      })
    })
  })

  describe('updateListingCategory', () => {
    describe('When updating a listing category', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<UpdateListingCategoryDto>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: VendorStub()._id as any,
          data: {
            catId: ListingMenuStub().vendorId
          }
        }
        response = await listingsController.updateListingCategory(
          data,
          context
        )
      })
      test('then it should call listingService.updateListingCat', () => {
        expect(listingsService.updateListingCat).toHaveBeenCalledWith(
          data.data
        )
      })

      test('then it should return a success response', () => {
        expect(response).toStrictEqual({ status: 1 })
      })
    })
  })

  describe('createListingOption', () => {
    describe('When a creating a listing option', () => {
      let response: ResponseWithStatus
      let data: ServicePayload<CreateOptionGroupDto>
      let context: RmqContext

      beforeEach(async () => {
        data = {
          userId: '',
          data: {
            name: 'Main Protien',
            min: 0,
            max: 2,
            options: [
              {
                name: 'Cow meat',
                price: '300'
              },
              {
                name: 'Goat meat',
                price: '200'
              }
            ]
          }
        }
        response = await listingsController.createListingOption(data, context)
      })
      test('then it should call getVendor', () => {
        expect(listingsService.createListingOptionGroup).toHaveBeenCalledWith(
          data
        )
      })

      test('then it should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('getSingleListingOption', () => {
    describe('When getting a single listing option', () => {
      let response: ListingOptionGroup
      let context: RmqContext
      let data: ServicePayload<string>

      beforeEach(async () => {
        data = {
          userId: '',
          data: ListingOptionStub()._id as any
        }
        response = await listingsController.getSingleListingOption(
          data,
          context
        )
      })
      test('then it should call listingService.getSingleListingOption', () => {
        expect(listingsService.getSingleListingOption).toHaveBeenCalledWith(
          data
        )
      })

      test('then it should return a listing option', () => {
        expect(response).toStrictEqual(ListingOptionStub())
      })
    })
  })

  describe('getAllOptionVendor', () => {
    describe('When getting all vendor options', () => {
      let response: ListingOptionGroup[]
      let context: RmqContext
      let data: ServicePayload<null>

      beforeEach(async () => {
        data = {
          userId: '',
          data: null
        }
        response = await listingsController.getAllOptionVendor(data, context)
      })
      test('then it should call listingService.getAllListingOptionsVendor', () => {
        expect(listingsService.getAllListingOptionsVendor).toHaveBeenCalledWith(
          data.userId
        )
      })

      test('then it should return a list of all options', () => {
        expect(response).toStrictEqual([ListingOptionStub()])
      })
    })
  })

  describe('updateListingOption', () => {
    describe('When getting updating a listing option', () => {
      let response: ResponseWithStatus
      let context: RmqContext
      let payload: ServicePayload<UpdateOptionGroupDto>

      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            optionId: ListingOptionStub()._id as any
          }
        }
        response = await listingsController.updateListingOption(
          payload,
          context
        )
      })
      test('then it should call listingsService.updateListingOption', () => {
        expect(listingsService.updateListingOption).toHaveBeenCalledWith(
          payload.data
        )
      })

      test('then it should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })

  describe('updateListingMenu', () => {
    describe('When  updating a listing menu', () => {
      let response: ResponseWithStatus
      let context: RmqContext
      let payload: ServicePayload<any>

      beforeEach(async () => {
        payload = {
          userId: '',
          data: {
            menuId: ListingMenuStub()._id as any,
            isLive: false
          }
        }
        response = await listingsController.updateListingMenu(payload, context)
      })
      test('then it should call listingsService.updateListingMenu', () => {
        expect(listingsService.updateListingMenu).toHaveBeenCalledWith(payload)
      })

      test('then it should return a success status', () => {
        expect(response).toStrictEqual(resStub())
      })
    })
  })
})
