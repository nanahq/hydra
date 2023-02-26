
import { getModelToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { FilterQuery } from 'mongoose'
import { ListingCategoryRepository, ListingMenuRepository, ListingOptionGroupRepository } from '../listings.repository'
import { ListingOptionGroup, ListingCategory, ListingMenu } from '@app/common'
import { ListingGroupOptionModel, ListingMenuModel, ListingCategoryModel } from './support/Listing.model'
import { ListingOptionStub, ListingCategoryStub, ListingMenuStub } from './stubs/Listings.stub'

describe('ListingsMenu', () => {
  let listingsMenuRepository: ListingMenuRepository
  describe('find operations', () => {
    let listingModel: ListingMenuModel
    let listingFilterQuery: FilterQuery<ListingMenu>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          ListingMenuRepository,
          {
            provide: getModelToken(ListingMenu.name),
            useClass: ListingMenuModel
          }
        ]
      }).compile()

      listingsMenuRepository = moduleRef.get<ListingMenuRepository>(ListingMenuRepository)
      listingModel = moduleRef.get<ListingMenuModel>(getModelToken(ListingMenu.name))

      listingFilterQuery = {
        _id: ListingMenuStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let listingMenu: ListingMenu | null

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingsMenuRepository.findOne(listingFilterQuery)
        })

        test('then it should return a Listing Menu', () => {
          expect(listingMenu).toEqual(ListingMenuStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let listingMenu: ListingMenu[]

        beforeEach(async () => {
          jest.spyOn(listingModel, 'find')
          listingMenu = await listingsMenuRepository.find(listingFilterQuery)
        })

        test('then it should return a Listing Menu', () => {
          expect(listingMenu).toEqual([ListingMenuStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let listingMenu: ListingMenu

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingsMenuRepository.findOneAndUpdate(listingFilterQuery, { ...ListingMenuStub() })
        })

        test('then it should return a Listing Menu', () => {
          expect(listingMenu).toEqual(ListingMenuStub())
        })
      })
    })
  })
})

describe('ListingOptionGroup', () => {
  let listingOptionRepository: ListingOptionGroupRepository
  describe('find operations', () => {
    let listingModel: ListingGroupOptionModel
    let listingFilterQuery: FilterQuery<ListingMenu>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          ListingOptionGroupRepository,
          {
            provide: getModelToken(ListingOptionGroup.name),
            useClass: ListingGroupOptionModel
          }
        ]
      }).compile()

      listingOptionRepository = moduleRef.get<ListingOptionGroupRepository>(ListingOptionGroupRepository)
      listingModel = moduleRef.get<ListingGroupOptionModel>(getModelToken(ListingOptionGroup.name))

      listingFilterQuery = {
        _id: ListingMenuStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let listingMenu: ListingOptionGroup | null

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingOptionRepository.findOne(listingFilterQuery)
        })

        test('then it should return a Listing Option', () => {
          expect(listingMenu).toEqual(ListingOptionStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let listingMenu: ListingOptionGroup[]

        beforeEach(async () => {
          jest.spyOn(listingModel, 'find')
          listingMenu = await listingOptionRepository.find(listingFilterQuery)
        })

        test('then it should return a Listing option', () => {
          expect(listingMenu).toEqual([ListingOptionStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let listingMenu: ListingOptionGroup

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingOptionRepository.findOneAndUpdate(listingFilterQuery, { ...ListingOptionStub() })
        })

        test('then it should return a Listing option', () => {
          expect(listingMenu).toEqual(ListingOptionStub())
        })
      })
    })
  })
})

describe('ListingCategory', () => {
  let listingCategory: ListingCategoryRepository
  describe('find operations', () => {
    let listingModel: ListingCategoryModel
    let listingFilterQuery: FilterQuery<ListingMenu>

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          ListingCategoryRepository,
          {
            provide: getModelToken(ListingCategory.name),
            useClass: ListingCategoryModel
          }
        ]
      }).compile()

      listingCategory = moduleRef.get<ListingCategoryRepository>(ListingCategoryRepository)
      listingModel = moduleRef.get<ListingCategoryModel>(getModelToken(ListingCategory.name))

      listingFilterQuery = {
        _id: ListingMenuStub()._id
      }

      jest.clearAllMocks()
    })

    describe('findOne', () => {
      describe('when findOne is called', () => {
        let listingMenu: ListingCategory | null

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingCategory.findOne(listingFilterQuery)
        })

        test('then it should return a Listing Category', () => {
          expect(listingMenu).toEqual(ListingCategoryStub())
        })
      })
    })

    describe('find', () => {
      describe('when find is called', () => {
        let listingMenu: ListingCategory[]

        beforeEach(async () => {
          jest.spyOn(listingModel, 'find')
          listingMenu = await listingCategory.find(listingFilterQuery)
        })

        test('then it should return a Listing Category', () => {
          expect(listingMenu).toEqual([ListingCategoryStub()])
        })
      })
    })

    describe('findOneAndUpdate', () => {
      describe('when findOneAndUpdate is called', () => {
        let listingMenu: ListingCategory

        beforeEach(async () => {
          jest.spyOn(listingModel, 'findOne')
          listingMenu = await listingCategory.findOneAndUpdate(listingFilterQuery, { ...ListingCategoryStub() })
        })

        test('then it should return Listing Category', () => {
          expect(listingMenu).toEqual(ListingCategoryStub())
        })
      })
    })
  })
})
