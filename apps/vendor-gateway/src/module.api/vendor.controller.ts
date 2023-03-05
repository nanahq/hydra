import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { catchError, lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  Vendor,
  ServicePayload,
  IRpcException,
  ResponseWithStatus
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from './current-user.decorator'
import { CreateVendorDto, UpdateVendorSettingsDto } from '@app/common/database/dto/vendor.dto'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { GoogleFileService } from '../google-file.service'
@Controller('vendor')
export class VendorController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly googleService: GoogleFileService

  ) {}

  @Post('register')
  async registerNewVendor (@Body() request: CreateVendorDto): Promise<any> {
    this.logger.debug('Registering a new vendor')
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorClient.send(QUEUE_MESSAGE.CREATE_VENDOR, { ...request }).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(`Failed to register a new vendor. Reason: ${error.message}`)
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
  @Put('logo')
  async updateVendorLogo (
    @CurrentUser() vendor: Vendor,
      @UploadedFile() file: Express.Multer.File
  ): Promise<string> {
    const photo = await this.googleService.saveToCloud(file)
    const payload: ServicePayload<string> = {
      userId: vendor._id as any,
      data: photo
    }
    await lastValueFrom(
      this.vendorClient.emit(QUEUE_MESSAGE.UPDATE_VENDOR_LOGO, payload)
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
          this.logger.error(`Failed to update vendor profile. Reason: ${error.message}`)
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
      this.vendorClient.send(QUEUE_MESSAGE.GET_VENDOR_SETTINGS, { vid: _id, settingId: id })
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
      this.vendorClient.send(QUEUE_MESSAGE.CREATE_VENDOR_SETTINGS, payload)
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
      this.vendorClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_SETTING, payload)
        .pipe(
          catchError((error: IRpcException) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
