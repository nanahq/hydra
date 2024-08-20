import { Injectable, Logger } from '@nestjs/common'
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { fromEnv } from '@aws-sdk/credential-providers'
import { RandomGen } from '@app/common'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name)
  protected readonly AWS_S3_BUCKET: string
  public s3: S3
  constructor (private readonly configService: ConfigService) {
    const endpoint = this.configService.get('AWS_S3_ENDPOINT')
    this.AWS_S3_BUCKET = 'nana-vendors'
    this.s3 = new S3({
      credentials: fromEnv(),
      endpoint,
      forcePathStyle: true,
      region: 'uk'
    })
  }

  async upload (file: Express.Multer.File): Promise<string | undefined> {
    const Key = `vendors/${Date.now()}${RandomGen.genRandomString(100, 8)}.${
      file.mimetype.split('/')[1]
    }`

    const command = new PutObjectCommand({
      Key,
      Bucket: this.AWS_S3_BUCKET,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      ACL: 'public-read'
    })

    const url = `https://nana-vendors.s3.uk.io.cloud.ovh.net/${Key}`
    try {
      await this.s3.send(command)
      return url
    } catch (error) {
      this.logger.error({
        message: 'failed to save image to s3',
        error
      })
    }
  }
}
