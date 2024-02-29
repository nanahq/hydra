import { Injectable, Logger } from '@nestjs/common'
import { AbstractRepository, ScheduledListingNotification } from '@app/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class SubscriptionRepository extends AbstractRepository<ScheduledListingNotification> {
  protected readonly logger = new Logger(SubscriptionRepository.name)

  constructor (
  @InjectModel(ScheduledListingNotification.name)
    scheduledListingNotificationModel: Model<ScheduledListingNotification>
  ) {
    super(scheduledListingNotificationModel)
  }
}
