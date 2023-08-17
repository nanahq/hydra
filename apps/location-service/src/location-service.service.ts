import { Injectable } from '@nestjs/common'

@Injectable()
export class LocationService {
  getHello (): string {
    return 'Hello World!'
  }
}
