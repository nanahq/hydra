import {
  Body,
  Controller,
  Get,
  HttpException, HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Put, Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'

import { catchError, lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'
import { Response } from 'express'
import {
  CurrentUser,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ServicePayload,
  Vendor,
  UpdateVendorSettingsDto,
  CreateVendorDto, UpdateSubscriptionByVendorDto, ScheduledListingNotification
} from '@app/common'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { AwsService } from '../aws.service'

@Controller('vendor')
export class VendorController {
  private readonly logger = new Logger(VendorController.name)

  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy,

    @Inject(QUEUE_SERVICE.NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    private readonly awsService: AwsService
  ) {}

  @Post('register')
  async registerNewVendor (@Body() request: CreateVendorDto): Promise<any> {
    const { businessEmail, email, ...rest } = request
    this.logger.debug('Registering a new vendor')
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorClient
        .send(QUEUE_MESSAGE.CREATE_VENDOR, {
          businessEmail: businessEmail.toLowerCase(),
          email: email.toLowerCase(),
          ...rest
        })
        .pipe(
          catchError((error: IRpcException) => {
            this.logger.error(
              `Failed to register a new vendor. Reason: ${error.message}`
            )
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getVendorProfile (@CurrentUser() vendor: Vendor): Promise<Vendor> {
    return vendor
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: multer.memoryStorage()
    })
  )
  @Put('image/logo')
  async updateVendorLogo (
    @CurrentUser() vendor: Vendor,
      @UploadedFile() file: Express.Multer.File
  ): Promise<string | undefined> {
    const photo = await this.awsService.upload(file)
    const payload: ServicePayload<undefined | string> = {
      userId: vendor._id as any,
      data: photo
    }
    await lastValueFrom(
      this.vendorClient.emit(QUEUE_MESSAGE.UPDATE_VENDOR_LOGO, payload)
        .pipe(catchError((error) => {
          throw new HttpException(error.message, error.status)
        }))
    )
    return photo
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage()
    })
  )
  @Put('image/restaurant')
  async updateVendorRestaurantImage (
    @CurrentUser() vendor: Vendor,
      @UploadedFile() file: Express.Multer.File
  ): Promise<string | undefined> {
    const photo = await this.awsService.upload(file)
    const payload: ServicePayload<string | undefined> = {
      userId: vendor._id as any,
      data: photo
    }
    await lastValueFrom(
      this.vendorClient.emit(QUEUE_MESSAGE.UPDATE_VENDOR_IMAGE, payload)
    )
    return photo
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateVendorProfile (
    @Body() data: Partial<Vendor>,
      @CurrentUser() vendor: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<Partial<Vendor>> = {
      userId: vendor._id as any,
      data
    }
    this.logger.debug('Updating vendor profile')
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE, payload).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(
            `Failed to update vendor profile. Reason: ${error.message}`
          )
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings/:id')
  async getSetting (
    @Param('id') id: string,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    return await lastValueFrom(
      this.vendorClient
        .send(QUEUE_MESSAGE.GET_VENDOR_SETTINGS, {
          vid: _id,
          settingId: id
        })
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async createSettings (
    @Body() data: UpdateVendorSettingsDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateVendorSettingsDto> = {
      userId: _id as any,
      data
    }
    return await lastValueFrom(
      this.vendorClient
        .send(QUEUE_MESSAGE.CREATE_VENDOR_SETTINGS, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async update (
    @Body() data: UpdateVendorSettingsDto,
      @CurrentUser() { _id }: Vendor
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<UpdateVendorSettingsDto> = {
      userId: _id as any,
      data
    }
    return await lastValueFrom(
      this.vendorClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_SETTING, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @UseGuards(JwtAuthGuard)
  @Put('subscription')
  async updateSubscriptionNotification (
    @Body() data: UpdateSubscriptionByVendorDto,
      @Res() response: Response
  ): Promise<void> {
    await lastValueFrom(
      this.notificationClient.emit(QUEUE_MESSAGE.USER_SUBSCRIBE_TO_VENDOR, data).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )

    response.status(HttpStatus.OK).end()
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription (
    @CurrentUser() vendor: Vendor
  ): Promise<ScheduledListingNotification> {
    const payload: ServicePayload<null> = {
      userId: vendor._id as any,
      data: null
    }
    return await lastValueFrom(
      this.notificationClient.send(QUEUE_MESSAGE.GET_VENDOR_SUBSCRIPTION, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
