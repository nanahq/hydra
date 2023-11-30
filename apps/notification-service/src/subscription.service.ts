import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SubscriptionRepository } from './subscription.repository'
import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import {
  ExportPushNotificationClient,
  FitRpcException, PushMessage, ScheduledListingNotification, ScheduledPushPayload, SendApprovalPushNotification,
  SubscribeDto, SubscriptionNotification,
  UpdateSubscriptionByVendorDto
} from '@app/common'

import * as moment from 'moment'
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)
  constructor (
    private readonly configService: ConfigService,

    private readonly subscriptionRepository: SubscriptionRepository,

    private readonly pushNotificationClient: ExportPushNotificationClient
  ) {}

  async getUserSubscriptions (userId: string): Promise<ScheduledListingNotification[]> {
    try {
      return await this.subscriptionRepository.find({ subscribers: { $in: [userId] } })
    } catch (error) {
      this.logger.log(JSON.stringify({
        message: 'PIM -> failed to fetch subscription',
        error
      }))
      throw new FitRpcException('Can not fetch subscription at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getVendorSubscription (vendor: string): Promise<ScheduledListingNotification> {
    try {
      return await this.subscriptionRepository.findOne({ vendor })
    } catch (error) {
      this.logger.log(JSON.stringify({
        message: 'PIM -> failed to fetch subscription',
        error
      }))
      throw new FitRpcException('Can not fetch subscription at this time', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createSubscriptionInstance (payload: SendApprovalPushNotification): Promise<void> {
    try {
      await this.subscriptionRepository.create({
        vendor: payload.vendor,
        subscribers: [],
        enabledByVendor: true
      })

      if (payload.token !== undefined) {
        const message: PushMessage = {
          title: 'Your Account Has Been Approved!',
          body: 'A warm welcome to Nana! Your account has been approved.',
          priority: 'high'
        }
        await this.pushNotificationClient.sendSingleNotification(payload.token, message)
      }
    } catch (error) {
      throw new FitRpcException('Can not create a subscription object for vendor', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async subscribeUnsubscribeUser (payload: SubscribeDto): Promise<void> {
    try {
      const sub = await this.subscriptionRepository.findOne({ vendor: payload.vendor })
      if (sub === null) {
        return
      }

      let newSubscribers: string[]
      const userIsSubscribed = sub.subscribers.find(id => id === payload.subscriberId)

      if (userIsSubscribed !== undefined) {
        newSubscribers = sub.subscribers.filter(id => id !== payload.subscriberId)
      } else {
        newSubscribers = [...sub.subscribers, payload.subscriberId]
      }

      await this.subscriptionRepository.findOneAndUpdate({ _id: sub._id }, {
        subscribers: newSubscribers
      })
    } catch (error) {
      throw new FitRpcException('Can not subscribe to notification at this moment', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateSubscriptionSetting (payload: UpdateSubscriptionByVendorDto): Promise<void> {
    try {
      await this.subscriptionRepository.findOneAndUpdate({ vendor: payload.vendor }, { enabledByVendor: payload.enabledByVendor })
    } catch (error) {
      throw new FitRpcException('Can not update subscription settings at this time. Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendPushMessageToSubscribers (payload: ScheduledPushPayload): Promise<void> {
    try {
      const subscription: SubscriptionNotification = await this.subscriptionRepository.findOneAndPopulate({ vendor: payload.vendor }, ['subscribers', 'vendor'])
      if (subscription.subscribers.length === 0) {
        return
      }
      const availableDate = moment(payload.listingAvailableDate).format('dddd Do')
      const notificationTokens: any[] = subscription
        .subscribers
        .map(sub => sub?.expoNotificationToken)
        .filter(token => Expo.isExpoPushToken(token))
      const message: Omit<ExpoPushMessage, 'to'> = {
        body: `${subscription.vendor.businessName}'s ${payload.listingName} will be available on ${availableDate}`,
        title: 'Place your Order Now!'
      }

      await this.pushNotificationClient.sendMultipleNotifications(notificationTokens, message)
      console.log('Sent push notification')
    } catch (error) {
      this.logger.log(JSON.stringify({
        message: 'PIM -> failed to send subscription notification to users',
        error
      }))
      throw new FitRpcException('Can not send notification subscription to users at this time at this time. Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
