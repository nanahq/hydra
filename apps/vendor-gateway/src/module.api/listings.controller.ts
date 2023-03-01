import {
  Body,
  Controller,
  Get, HttpCode,
  HttpException, HttpStatus,
  Inject,
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
  IRpcException,
  ResponseWithStatus,
  ServicePayload,
  Vendor,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  booleanParser,
  ListingMenu
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../../../admin-gateway/src/module.api/current-user.decorator'
import {
  CreateListingCategoryDto,
  CreateListingMenuDto,
  CreateOptionGroupDto,
  UpdateListingCategoryDto,
  UpdateOptionGroupDto
} from '@app/common/database/dto/listing.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { GoogleFileService } from '../google-file.service'
import { Logger } from 'winston'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Controller('listing')
export class ListingsController {
  constructor (
    @Inject(QUEUE_SERVICE.LISTINGS_SERVICE)
    private readonly listingClient: ClientProxy,
    private readonly googleService: GoogleFileService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger
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
        .send(QUEUE_MESSAGE.GET__ALL_LISTING_MENU, payload)
        .pipe(
          catchError((error: IRpcException) => {
            this.logger.error(`Failed to fetch listing menus. Reason: ${error.message}`)
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  // Listings Menu
  @UseGuards(JwtAuthGuard)
  @Post('menu')
  @UseInterceptors(
    FileInterceptor('listingImage', {
      storage: multer.memoryStorage()
    })
  )
  async createListingMenu (
    @Body() data: CreateListingMenuDto,
      @CurrentUser() { _id }: Vendor,
      @UploadedFile() file: Express.Multer.File
  ): Promise<any> {
    const photo = await this.googleService.saveToCloud(file)
    const payload: ServicePayload<any> = {
      userId: _id as any,
      data: {
        ...data,
        photo,
        isLive: booleanParser(data.isLive),
        isAvailable: booleanParser(data.isAvailable),
        optionGroups: data.optionGroups.split(',')
      }
    }
    this.logger.debug('Creating new listing menu')
    return await lastValueFrom<ResponseWithStatus>(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING_MENU, { ...payload })
        .pipe(
          catchError<any, any>((error: IRpcException) => {
            this.logger.error(`Failed to create new listing menu. Reason: ${error.message}`)
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
            this.logger.error(`Failed to get listing menu. Reason: ${error.message}`)
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('menu')
  async updateMenu (
      @Body() data: {isLive: boolean, isAvailable: boolean, menuId: string},
      @CurrentUser() vendor: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<{isLive: boolean, isAvailable: boolean, menuId: string}> =  {
      userId: vendor._id as any,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
        this.listingClient.send(QUEUE_MESSAGE.UPDATE_LISTING_MENU, payload )
            .pipe(
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
}
