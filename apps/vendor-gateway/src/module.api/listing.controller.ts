import {
  QUEUE_MESSAGE,
  QUEUE_SERVICE
} from '@app/common/typings/QUEUE_MESSAGE'
import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Post
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { ListingDto } from '@app/common/database/dto/listing.dto'

@Controller('/listing')
export class ListingController {
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly listingClient: ClientProxy
  ) {}

  @Get('/')
  async fetchListing (): Promise<any> {
    return await lastValueFrom(
      this.listingClient.send(QUEUE_MESSAGE.GET_LISTINGS, {}).pipe(
        catchError((error) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Post('/create')
  async registerNewUser (@Body() request: ListingDto): Promise<any> {
    return await lastValueFrom(
      this.listingClient
        .send(QUEUE_MESSAGE.CREATE_LISTING, { ...request })
        .pipe(
          catchError((error) => {
            throw new HttpException(error.message, error.status)
          })
        )
    )
  }
}
