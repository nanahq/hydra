import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { catchError, lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  Vendor,
  ServicePayload,
  IRpcException,
  ResponseWithStatus,
} from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from './current-user.decorator';
import { CreateVendorDto } from '@app/common/database/dto/vendor.dto';

@Controller('vendor')
export class VendorController {
  constructor(
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorClient: ClientProxy,
  ) {}

  @Post('register')
  async registerNewVendor(@Body() request: CreateVendorDto): Promise<any> {
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorClient.send(QUEUE_MESSAGE.CREATE_VENDOR, { ...request }).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getVendorProfile(@CurrentUser() vendor: Vendor): Promise<Vendor> {
    return vendor;
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateVendorProfile(
    @Body() data: Partial<Vendor>,
    @CurrentUser() vendor: Vendor,
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<Partial<Vendor>> = {
      userId: vendor._id as any,
      data,
    };
    return await lastValueFrom<ResponseWithStatus>(
      this.vendorClient.send(QUEUE_MESSAGE.UPDATE_VENDOR_PROFILE, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status);
        }),
      ),
    );
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete('delete-profile')
  // async deleteVendorProfile (
  //   @CurrentUser() vendor: VendorEntity
  // ): Promise<ResponseWithStatus> {
  //   const payload: ServicePayload<null> = {
  //     userId: vendor.id,
  //     data: null
  //   }

  //   return await lastValueFrom<ResponseWithStatus>(
  //     this.vendorClient.send(QUEUE_MESSAGE.DELETE_VENDOR_PROFILE, payload).pipe(
  //       catchError((error: IRpcException) => {
  //         throw new HttpException(error.message, error.status)
  //       })
  //     )
  //   )
  // }
}
