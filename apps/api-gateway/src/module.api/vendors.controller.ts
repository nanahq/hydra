import { ClientProxy } from '@nestjs/microservices'
import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  UseGuards
} from '@nestjs/common'
import {
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ServicePayload,
  Vendor
} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('vendor')
export class VendorsController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @Get('vendors')
  @UseGuards(JwtAuthGuard)
  async getVendors (): Promise<Vendor[]> {
    return await lastValueFrom<Vendor[]>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_ALL_VENDORS_USERS, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('/:vendorId')
  @UseGuards(JwtAuthGuard)
  async getVendor (
    @Param('vendorId') vendorId: string
  ): Promise<Partial<Vendor>> {
    const payload: ServicePayload<string> = {
      userId: '',
      data: vendorId
    }
    const vendor = await lastValueFrom<Vendor>(
      this.vendorsClient.send(QUEUE_MESSAGE.GET_VENDOR, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )

    const { _id, businessName, businessAddress, businessLogo, phone } = vendor

    return {
      _id,
      businessName,
      businessAddress,
      businessLogo,
      phone
    }
  }
}
