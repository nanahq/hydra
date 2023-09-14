import { Injectable, Logger } from '@nestjs/common'
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { fromEnv } from '@aws-sdk/credential-providers'
import { RandomGen } from '@app/common'
@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name)
  protected readonly AWS_S3_BUCKET
  public s3: S3
  constructor () {
    this.AWS_S3_BUCKET = 'nana-ng'
    this.s3 = new S3({
      credentials: fromEnv(),
      region: 'af-south-1'
    })
  }

  async upload (file: Express.Multer.File): Promise<string | undefined> {
    const Key = `vendors/${Date.now()}${RandomGen.genRandomString(100, 8)}.${file.mimetype.split('/')[1]}`

    const command = new PutObjectCommand({
      Key,
      Bucket: this.AWS_S3_BUCKET,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      ACL: 'public-read'
    })

    const url = `https://nana-ng.s3.af-south-1.amazonaws.com/${Key}`
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
