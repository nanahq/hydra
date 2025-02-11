import { Injectable } from '@nestjs/common'
import { APIClient, SendPushRequest } from "customerio-node"
import { ConfigService } from '@nestjs/config'
@Injectable()
export class CustomerIoClient {
    private readonly apiClient: APIClient
    constructor (
        private readonly configService: ConfigService,
    ) {
        this.apiClient = new APIClient(this.configService.get('CUSTOMER_IO_KEY') ?? '');
    }

     public async sendPushNotification (userId: string, messageId): Promise<void> {
        try {
            const request = new SendPushRequest({
                transactional_message_id: messageId,
                identifiers: {
                    id: userId,
                },
            });
            await this.apiClient.sendPush(request);
        } catch (error) {
            console.error(error);
        }

    }
}