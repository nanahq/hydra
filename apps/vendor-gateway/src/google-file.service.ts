import { Storage } from '@google-cloud/storage'

export class GoogleFileService {
  private readonly BUCKET_NAME: string
  private readonly PROJECT_ID: string
  constructor () {
    this.BUCKET_NAME = 'eatlater_vendors_bucket'
    this.PROJECT_ID = 'eatlater-alpha'
  }

  async saveToCloud (file: Express.Multer.File): Promise<string> {
    const gc = new Storage({
      keyFilename: 'keymap.json',
      projectId: this.PROJECT_ID
    })

    const bucket = gc.bucket(this.BUCKET_NAME)

    return await new Promise((resolve) => {
      const blob = bucket.file(file.originalname)
      const blobStream = blob.createWriteStream()
      blobStream.on('finish', () => {
        resolve(
          `https://storage.googleapis.com/${this.BUCKET_NAME}/${file.originalname}`
        )
      })
      blobStream.end(file.buffer)
    })
  }
}
