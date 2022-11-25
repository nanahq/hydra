import { Body, Controller, Get, HttpException, Inject, Param, Post, UseGuards } from '@nestjs/common'
import {
  IRpcException,
  OrderDto,
  QUEUE_MESSAGE,
  QUEUE_SERVICE,
  ResponseWithStatus,
  ReviewEntity,
  ServicePayload,
  UserEntity
} from '@app/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom } from 'rxjs'
import { CurrentUser } from './current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@Controller('reviews')
export class ReviewController {
  constructor (
    @Inject(QUEUE_SERVICE.REVIEWS_SERVICE)
    private readonly reviewClient: ClientProxy
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async create (
    @Body() data: OrderDto,
      @CurrentUser() user: UserEntity
  ): Promise<ResponseWithStatus> {
    const payload: ServicePayload<any> = {
      userId: user.id,
      data
    }
    return await lastValueFrom<ResponseWithStatus>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_CREATE, payload).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne (@Param('id') reviewId: string): Promise<ReviewEntity> {
    return await lastValueFrom<ReviewEntity>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_FIND_ONE, { reviewId }).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getAll (@CurrentUser() user: UserEntity): Promise<ReviewEntity[]> {
    console.log('Hello World')
    return await lastValueFrom<ReviewEntity[]>(
      this.reviewClient.send(QUEUE_MESSAGE.REVIEW_ADMIN_GET_ALL_IN_DB, {}).pipe(
        catchError((error: IRpcException) => {
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
