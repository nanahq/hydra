import { HttpStatus, Injectable } from '@nestjs/common'

import {
  FitRpcException,
  ListingCategory,
  ListingMenu,
  ListingOptionGroup,
  ResponseWithStatus,
  ServicePayload
} from '@app/common'
import { ListingCategoryRepository, ListingMenuRepository, ListingOptionGroupRepository } from './listings.repository'
import {
  CreateListingCategoryDto,
  CreateOptionGroupDto,
  UpdateListingCategoryDto,
  UpdateOptionGroupDto
} from '@app/common/database/dto/listing.dto'

@Injectable()
export class ListingsService {
  constructor (
    private readonly listingMenuRepository: ListingMenuRepository,
    private readonly listingOptionGroupRepository: ListingOptionGroupRepository,
    private readonly listingCategoryRepository: ListingCategoryRepository
  ) {}

  async createListingMenu ({
    data,
    userId: vendorId
  }: ServicePayload<any>): Promise<ResponseWithStatus> {
    const { categoryId, ...rest } = data
    try {
      const { _id, listingsMenu } =
        (await this.listingCategoryRepository.findOne({
          _id: categoryId
        })) as ListingCategory

      const newListings = await this.listingMenuRepository.create({
        ...rest,
        vendorId
      })
      await this.listingCategoryRepository.findOneAndUpdate(
        { _id },
        { listingsMenu: [...listingsMenu, newListings._id] }
      )
      return { status: 1 }
    } catch (error) {
      console.error(error)
      throw new FitRpcException(
        'Can not process your request. Try again later',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
  }

  async updateListingMenu ({ data: { menuId, ...rest }, userId }: ServicePayload<any>): Promise<ResponseWithStatus> {
    try {
      await this.listingMenuRepository.findOneAndUpdate({ _id: menuId, vendorId: userId }, { ...rest })
      return { status: 1 }
    } catch (e) {
      throw new FitRpcException('Failed to update listings', HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }

  async getAllListingMenu (vendorId: string): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      vendorId,
      isDeleted: false
    }, 'optionGroups') as any

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getSingleListingMenu ({
    data
  }: ServicePayload<string>): Promise<ListingMenu> {
    try {
      const listing = await this.listingMenuRepository.findOneAndPopulate(
        { _id: data },
        'optionGroups'
      )
      if (listing === null) {
        throw new FitRpcException(
          'Listing with that id can not be found',
          HttpStatus.NOT_FOUND
        )
      }
      return listing
    } catch (error) {
      throw new FitRpcException(
        'Failed to fetch listing',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async createListingCategory ({
    data,
    userId
  }: ServicePayload<CreateListingCategoryDto>): Promise<ResponseWithStatus> {
    try {
      await this.listingCategoryRepository.create({
        ...data,
        vendor: userId
      })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Invalid Request. Please check and try again',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getSingleListingCat ({
    data: _id,
    userId: vendorId
  }: ServicePayload<string>): Promise<ListingCategory> {
    try {
      const cat = await this.listingCategoryRepository.findOneAndPopulate(
        { _id, vendorId },
        ['listingsMenu', 'vendor']
      )
      if (cat === null) {
        throw new FitRpcException('Category not found', HttpStatus.NOT_FOUND)
      }

      return cat
    } catch (error) {
      throw new FitRpcException(
        'Some thing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllCatVendor (vendorId: string): Promise<ListingCategory[]> {
    try {
      return await this.listingCategoryRepository.findAndPopulate<ListingCategory>(
        { vendorId, isDeleted: false },
        'listingsMenu vendor'
      )
    } catch (error) {
      throw new FitRpcException(
        'Can not fetch listings. Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateListingCat ({
    catId,
    ...rest
  }: UpdateListingCategoryDto): Promise<ResponseWithStatus> {
    try {
      await this.listingCategoryRepository.findOneAndUpdate(
        { _id: catId },
        { ...rest }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update Category',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async createListingOptionGroup ({
    data,
    userId
  }: ServicePayload<CreateOptionGroupDto>): Promise<ResponseWithStatus> {
    try {
      await this.listingOptionGroupRepository.create({
        ...data,
        vendorId: userId
      })
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Invalid Request. Please check and try again',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async getSingleListingOption ({
    data: _id,
    userId: vendorId
  }: ServicePayload<string>): Promise<ListingOptionGroup> {
    try {
      const cat = await this.listingOptionGroupRepository.findOne({
        _id,
        vendorId
      })

      if (cat === null) {
        throw new FitRpcException('Category not found', HttpStatus.NOT_FOUND)
      }

      return cat
    } catch (error) {
      throw new FitRpcException(
        'Some thing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getAllListingOptionsVendor (
    vendorId: string
  ): Promise<ListingOptionGroup[]> {
    try {
      return await this.listingOptionGroupRepository.find({
        vendorId,
        isDeleted: false
      })
    } catch (error) {
      throw new FitRpcException(
        'Can not fetch listings. Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateListingOption ({
    optionId,
    ...rest
  }: UpdateOptionGroupDto): Promise<ResponseWithStatus> {
    try {
      await this.listingOptionGroupRepository.findOneAndUpdate(
        { _id: optionId },
        { ...rest }
      )
      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not update Option Group',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  // Users Vendor Methods
  async getAllMenuUser (): Promise<ListingMenu[]> {
    try {
      return await this.listingMenuRepository.findAndPopulate({ isDeleted: false }, 'optionGroups')
    } catch (error) {
      throw new FitRpcException('Can not fetch menu at thi time.', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getSingleUserMenu (mid: string): Promise<ListingMenu> {
    const menu = await this.listingMenuRepository.findOneAndPopulate({ _id: mid }, 'optionGroups')

    if (menu === null) {
      throw new FitRpcException('Can not find menu with that ID', HttpStatus.NOT_FOUND)
    }

    return menu
  }

  async getAllCategoriesUsers (): Promise<ListingCategory[]> {
    try {
      return await this.listingCategoryRepository.findAndPopulate({}, ['listingsMenu', 'vendor'])
    } catch (error) {
      throw new FitRpcException('Can not get categories at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getSingleUserCategory (catid: string): Promise<ListingCategory> {
    const category = await this.listingCategoryRepository.findOneAndPopulate({ _id: catid }, ['listingsMenu', 'vendor'])

    if (category === null) {
      throw new FitRpcException('Can not find category with that ID', HttpStatus.NOT_FOUND)
    }

    return category
  }
}
