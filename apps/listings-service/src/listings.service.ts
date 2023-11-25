import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'

import {
  FitRpcException, ListingApprovePush,
  ListingCategory,
  ListingCategoryI,
  ListingMenu, ListingMenuI,
  ListingOptionGroup, ListingRejectPush, QUEUE_MESSAGE, QUEUE_SERVICE,
  ResponseWithStatus,
  ScheduledListing,
  ScheduledListingDto, ScheduledPushPayload,
  ServicePayload
} from '@app/common'
import {
  ListingCategoryRepository,
  ListingMenuRepository,
  ListingOptionGroupRepository,
  ScheduledListingRepository
} from './listings.repository'
import {
  CreateListingCategoryDto,
  CreateOptionGroupDto,
  UpdateListingCategoryDto,
  UpdateOptionGroupDto
} from '@app/common/database/dto/listing.dto'
import { ListingApprovalStatus } from '@app/common/typings/ListingApprovalStatus.enum'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class ListingsService {
  protected readonly logger = new Logger(ListingsService.name)
  constructor (
    private readonly listingMenuRepository: ListingMenuRepository,
    private readonly listingOptionGroupRepository: ListingOptionGroupRepository,
    private readonly listingCategoryRepository: ListingCategoryRepository,
    private readonly scheduledListingRepository: ScheduledListingRepository,
    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy
  ) {}

  async createListingMenu ({
    data,
    userId: vendorId
  }: ServicePayload<any>): Promise<ResponseWithStatus> {
    const {
      categoryId,
      ...rest
    } = data
    try {
      const {
        _id,
        listingsMenu
      } =
        (await this.listingCategoryRepository.findOne({
          _id: categoryId
        })) as ListingCategory

      const newListings = await this.listingMenuRepository.create({
        ...rest,
        vendor: vendorId,
        status: ListingApprovalStatus.PENDING
      })

      await this.listingCategoryRepository.findOneAndUpdate(
        { _id },
        { listingsMenu: [...listingsMenu, newListings._id] }
      )

      return { status: 1 }
    } catch (error) {
      throw new FitRpcException(
        'Can not process your request. Try again later',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }
  }

  async updateListingMenu ({
    data: {
      menuId,
      ...rest
    },
    userId
  }: ServicePayload<any>): Promise<ResponseWithStatus> {
    try {
      await this.listingMenuRepository.findOneAndUpdate({
        _id: menuId,
        vendor: userId
      }, { ...rest })
      return { status: 1 }
    } catch (e) {
      throw new FitRpcException('Failed to update listings', HttpStatus.UNPROCESSABLE_ENTITY)
    }
  }

  async getAllPendingListingMenu (): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      isDeleted: false,
      status: ListingApprovalStatus.PENDING
    }, ['optionGroups', 'vendor']) as any

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }

    return getRequest
  }

  async getAllApprovedListingMenu (): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      isDeleted: false,
      status: ListingApprovalStatus.APPROVED
    }, ['optionGroups', 'vendor']) as any

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllRejectedListingMenu (): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      isDeleted: false,
      status: ListingApprovalStatus.DISAPPROVED
    }, ['optionGroups', 'vendor']) as any

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllListingMenu (): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      isDeleted: false
    }, ['optionGroups', 'vendor']) as any

    if (getRequest === null) {
      throw new FitRpcException(
        'Something went wrong fetching all listings.',
        HttpStatus.BAD_REQUEST
      )
    }
    return getRequest
  }

  async getAllVendorListingMenu (vendor: string): Promise<ListingMenu[]> {
    const getRequest = await this.listingMenuRepository.findAndPopulate({
      vendor,
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

  public async approve (_id: string): Promise<ResponseWithStatus> {
    const updateRequest = await this.listingMenuRepository.findOneAndUpdate(
      { _id },
      {
        status: ListingApprovalStatus.APPROVED
      }
    )

    const listing = await this.listingMenuRepository.findOneAndPopulate({ _id }, ['vendor']) as unknown as ListingMenuI

    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to approve listing menu',
        HttpStatus.BAD_REQUEST
      )
    }

    this.logger.log(`Sending approval push to ${listing.vendor.businessName}`)

    const payload: ListingApprovePush = {
      token: listing.vendor.expoNotificationToken,
      listingName: listing.name,
      vendorName: listing.vendor.businessName
    }
    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.NOTIFICATION_LISTING_APPROVED, payload)
    )

    return { status: 1 }
  }

  public async disapprove (_id: string, reason: string): Promise<ResponseWithStatus> {
    const updateRequest = await this.listingMenuRepository.findOneAndUpdate(
      { _id },
      {
        rejection_reason: reason,
        status: ListingApprovalStatus.DISAPPROVED
      }
    )

    const listing = await this.listingMenuRepository.findOneAndPopulate({ _id }, ['vendor']) as unknown as ListingMenuI

    if (updateRequest === null) {
      throw new FitRpcException(
        'Failed to reject listing menu',
        HttpStatus.BAD_REQUEST
      )
    }

    this.logger.log(`Sending rejection push to ${listing.vendor.businessName}`)

    const payload: ListingRejectPush = {
      token: listing.vendor.expoNotificationToken,
      listingName: listing.name,
      vendorName: listing.vendor.businessName,
      rejectionReason: reason
    }
    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.NOTIFICATION_LISTING_REJECTED, payload)
    )

    return { status: 1 }
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

  async findOneById (id: string): Promise<ListingMenu> {
    try {
      const listing = await this.listingMenuRepository.findOneAndPopulate(
        { _id: id },
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
      if ((Boolean(error.status)) && error.status === 404) {
        throw error
      }

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
        {
          _id,
          vendorId
        },
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

  async getAllCatVendor (vendor: string): Promise<ListingCategory[]> {
    try {
      return await this.listingCategoryRepository.findAndPopulate<ListingCategory>(
        {
          vendor,
          isDeleted: false
        },
        ['listingsMenu', 'vendor']
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

  async getAllMenuUser (): Promise<ListingMenu[]> {
    try {
      return await this.listingMenuRepository.findAndPopulate({
        isDeleted: false,
        status: ListingApprovalStatus.APPROVED
      }, ['optionGroups', 'vendor'])
    } catch (error) {
      throw new FitRpcException('Can not fetch menu at this time.', HttpStatus.INTERNAL_SERVER_ERROR)
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

  async createScheduledListing (data: ScheduledListingDto): Promise<ResponseWithStatus> {
    try {
      await this.scheduledListingRepository.create({ ...data, remainingQuantity: data.quantity })

      const listingMenu: ListingMenuI = await this.listingMenuRepository.findOneAndPopulate({ _id: data.listing }, ['vendor'])

      this.logger.log('sending push scheduled to subscribe')

      if (listingMenu !== null) {
        const notificationPayload: ScheduledPushPayload = {
          vendor: listingMenu.vendor.businessName,
          listingName: listingMenu.name,
          listingAvailableDate: data.availableDate
        }
        await lastValueFrom(this.notificationClient.emit(QUEUE_MESSAGE.SEND_PUSH_NOTIFICATION_LISTING, notificationPayload))
      }
      return { status: 1 }
    } catch (error) {
      this.logger.error({
        error
      })
      throw new FitRpcException('Can not create schedule listings at this time something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateScheduledListingCount (listingMenuIds: string[], quantity: Array<{ listing: string, quantity: number }>): Promise<void> {
    try {
      const listings = await this.scheduledListingRepository.find({ listing: { $in: listingMenuIds } })

      for (const item of quantity) {
        const listing = listings.find((l) => l.listing === item.listing)
        const soldOut = (listing.remainingQuantity - item.quantity) === 0
        if (listing !== null) {
          await this.scheduledListingRepository.findOneAndUpdate({ _id: listing._id }, {
            remainingQuantity: listing.remainingQuantity - item.quantity,
            soldOut
          })
        }
      }
    } catch (error) {
      throw new FitRpcException('Cannot update scheduled listings at this time; something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllScheduledListing (vendor: string): Promise<ScheduledListing[] > {
    try {
      return await this.scheduledListingRepository.findAndPopulate({ vendor }, ['listing', 'vendor'])
    } catch (error) {
      this.logger.error({
        error
      })
      throw new FitRpcException('Can not create schedule listings at this time something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getAllScheduledListingUser (): Promise<ScheduledListing[] > {
    try {
      return await this.scheduledListingRepository.findAndPopulate({ }, ['listing', 'vendor'])
    } catch (error) {
      this.logger.error({
        error
      })
      throw new FitRpcException('Can not create schedule listings at this time something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getVendorCategories (vendor: string): Promise<ListingCategory[]> {
    try {
      return await this.listingCategoryRepository.findAndPopulate({ vendor, isLive: true }, ['listingsMenu'])
    } catch (error) {
      this.logger.error(error)
      throw new FitRpcException('Can not fetch vendor listings at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getVendorListings (vendor: string): Promise<any[]> {
    try {
      const rawModel = this.listingCategoryRepository.findRaw()
      const listings: ListingCategoryI[] = await rawModel.find({ vendor, isLive: true })
        .populate({
          path: 'listingsMenu',
          populate: {
            path: 'optionGroups'
          }
        })
      return listings.map((li) => {
        return li.listingsMenu.filter((menu) => menu.status === ListingApprovalStatus.APPROVED)
      })
    } catch (error) {
      this.logger.error({
        error
      })
      throw new FitRpcException('Can not fetch vendor listings at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS, {
    timeZone: 'Africa/Lagos'
  })
  async deletePastScheduledListings (): Promise<void> {
    try {
      this.logger.log('[CRON] -> Deleting past day scheduled listings')

      const listings = await this.scheduledListingRepository.find({}) as ScheduledListing[]

      this.logger.log(`[CRON] -> ${listings.length} scheduled listings to be deleted `)

      const idsToDelete: any[] = []

      const currentDate = new Date()

      for (const listing of listings) {
        const listingDate = new Date(listing.availableDate)
        if (currentDate > listingDate) {
          idsToDelete.push(listing._id)
        }
      }

      if (idsToDelete.length > 0) {
        await this.scheduledListingRepository.deleteMany({ _id: { $in: idsToDelete } })
      }
    } catch (error) {
      this.logger.error('[CRON] -> Failed to delete past day scheduled listings:', error)
    }
  }
}
