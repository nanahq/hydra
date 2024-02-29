import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import { Logger } from '@nestjs/common'

export interface PushMessage {
  title: string
  body: string
  priority: 'high' | 'normal'
}

export class ExportPushNotificationClient {
  protected readonly logger = new Logger()

  private readonly expoClient: Expo
  constructor () {
    this.expoClient = new Expo({ accessToken: '' })
  }

  public async sendSingleNotification (
    token: string,
    message: PushMessage
  ): Promise<void> {
    try {
      await this.checkTokenValidity(token)

      const payload: ExpoPushMessage = {
        to: token,
        sound: 'default',
        ...message
      }
      await this.expoClient.sendPushNotificationsAsync([payload])
    } catch (error) {
      this.logger.error({
        message: 'failed to send  expo notification',
        error
      })
    }
  }

  public async sendMultipleNotifications (
    tokens: string[],
    message: Omit<ExpoPushMessage, 'to'>
  ): Promise<void> {
    try {
      const messages: ExpoPushMessage[] = []
      for (const pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(
            `Push token ${pushToken as string} is not a valid Expo push token`
          )
          continue
        }
        messages.push({
          to: pushToken,
          sound: 'default',
          ...message
        })
      }

      const chunks = this.expoClient.chunkPushNotifications(messages)

      for (const chunk of chunks) {
        await this.expoClient.sendPushNotificationsAsync(chunk)
      }
    } catch (error) {
      this.logger.error({
        error,
        message: 'Failed to send multiple notifications'
      })
    }
  }

  private async checkTokenValidity (pushToken: string): Promise<void> {
    return new Promise((resolve) => {
      if (!Expo.isExpoPushToken(pushToken)) {
        this.logger.error({
          message: `Push token ${
            pushToken as string
          } is not a valid Expo push token`
        })
        throw new Error(
          `Push token ${pushToken as string} is not a valid Expo push token`
        )
      } else {
        resolve()
      }
    })
  }
}
