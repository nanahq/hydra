import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'

import {
  booleanParser,
  CreateListingCategoryDto,
  CreateOptionGroupDto,
  CurrentUser,
  IRpcException,
  ListingMenu,
  MultiPurposeServicePayload,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  UpdateListingCategoryDto,
  UpdateOptionGroupDto,
  Vendor,
  CreateScheduledListingDto,
  ScheduledListingDto
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { AwsService } from '../aws.service'

@Controller('listing')
export class ListingsController {
  private readonly logger = new Logger(ListingsController.name)

  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy,
    private readonly awsService: AwsService
  ) {}

  @Get('menus')
  @UseGuards(JwtAuthGuard)
  async getAllListings (
    @CurrentUser() vendor: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: vendor._id as any,
      data: null
    }
    this.logger.debug('Getting all listing menus')
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_ALL_VENDOR_LISTING_MENU, payload)
        .pipe(
          catchError((error: IRpcException) => {
            this.logger.error(
              `Failed to fetch listing menus. Reason: ${error.message}`
            )
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  // Listings Menu
  @UseGuards(JwtAuthGuard)
  @Post('menu')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage()
    })
  )
  async createListingMenu (
    @Body() data: any,
      @CurrentUser() { _id }: Vendor,
      @UploadedFile() file: Express.Multer.File
  ): Promise<any> {
    const photo = await this.awsService.upload(file)
    this.logger.log(`Successfully save photo ${photo as string}`)
    const payload: ServicePayload<any> = {
      userId: _id as any,
      data: {
        ...data,
        photo,
        isLive: booleanParser(data.isLive),
        isAvailable: booleanParser(data.isAvailable),
        optionGroups: data?.optionGroups?.split(',') ?? []
      }
    }
    this.logger.log('Creating new listing menu')
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING_MENU, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            this.logger.error(
              `Failed to create new listing menu. Reason: ${error.message}`
            )
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('menu/:id')
  async getListingMenu (
    @CurrentUser() vendor: Vendor,
      @Param('id') menuId: string
  ): Promise<ListingMenu> {
    const payload: ServicePayload<string> = {
      userId: vendor._id as any,
      data: menuId
    }
    this.logger.debug('Getting a menu')
    return await lastValueFrom<ListingMenu>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_LISTING_MENU, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            this.logger.error(
              `Failed to get listing menu. Reason: ${error.message}`
            )
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('menu')
  async updateMenu (
    @Body() data: { isLive: boolean, isAvailable: boolean, menuId: string },
      @CurrentUser() vendor: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<{
      isLive: boolean
      isAvailable: boolean
      menuId: string
    }> = {
      userId: vendor._id as any,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient.send(QUEUE_MESSAGE.UPDATE_LISTING_MENU, payload).pipe(
        catchError<any, any>((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('category')
  async createListingCategory (
    @Body() data: CreateListingCategoryDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<CreateListingCategoryDto> = {
      data,
      userId: _id as any
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING_CAT, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('category/:id')
  async getSingleListingCategory (
    @Param('id') listingCatId: string,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<string> = {
      data: listingCatId,
      userId: _id as any
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_LISTING_CAT, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('categories')
  async getAllListingCategory (
    @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: _id as any,
      data: null
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_ALL_LISTING_CAT, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('category')
  async updateListingCategory (
    @Body() data: UpdateListingCategoryDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateListingCategoryDto> = {
      userId: _id as any,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.UPDATE_LISTING_CAT, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  // Listings Options

  @UseGuards(JwtAuthGuard)
  @Post('option')
  async createListingOption (
    @Body() data: CreateOptionGroupDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<CreateOptionGroupDto> = {
      data,
      userId: _id as any
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING_OP, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('option/:id')
  async getSingleListingOption (
    @Param('id') optionId: string,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<string> = {
      data: optionId,
      userId: _id as any
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_LISTING_OP, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('options')
  async getAllListingOptions (
    @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<null> = {
      userId: _id as any,
      data: null
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_ALL_LISTING_OP, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('option')
  async updateListingOptions (
    @Body() data: UpdateOptionGroupDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateOptionGroupDto> = {
      userId: _id as any,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.UPDATE_LISTING_OP, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('scheduled')
  async createScheduledListing (
    @Body() data: CreateScheduledListingDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ScheduledListingDto = {
      vendor: _id.toString(),
      ...data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_SCHEDULED_LISTING, payload)
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('scheduled')
  async getScheduledListings (
    @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: MultiPurposeServicePayload<null> = {
      id: _id as any,
      data: null
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.GET_SCHEDULED_LISTINGS, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
