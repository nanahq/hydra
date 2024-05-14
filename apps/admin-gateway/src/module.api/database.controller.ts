import { ClientProxy } from '@nestjs/microservices'
import {
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  UseGuards
} from '@nestjs/common'
import {
  Admin,
  AdminLevel,
  IRpcException,
  QUEUE_MESSAGE,
  QUEUE_SERVICE

} from '@app/common'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminClearance } from './decorators/user-level.decorator'
import { catchError, lastValueFrom } from 'rxjs'

@Controller('database')
@UseGuards(JwtAuthGuard)
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name)
  constructor (
    @Inject(QUEUE_SERVICE.VENDORS_SERVICE)
    private readonly vendorsClient: ClientProxy
  ) {}

  @Get('vendors')
  async seedDb (
    @AdminClearance([AdminLevel.SUPER_ADMIN]) admin: Admin
  ): Promise<void> {
    return await lastValueFrom(
      this.vendorsClient.send(QUEUE_MESSAGE.VENDORS_SEED_DATABASE, {}).pipe(
        catchError((error: IRpcException) => {
          this.logger.error(JSON.stringify(error))
          this.logger.error('[PIM] -> Something went wrong while seeding the vendors database')
          throw new HttpException(error.message, error.status)
        })
      )
    )
  }
}
