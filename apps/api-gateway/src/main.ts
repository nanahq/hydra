import { ConfigService } from '@nestjs/config'
import { RmqOptions } from '@nestjs/microservices'

import { QUEUE_SERVICE, RmqService } from '@app/common'
import { AppModule } from './app.module'
async function bootstrap (): Promise<void> {
  const app = await AppModule.create()
  const port = app.get(ConfigService).get<string>('USER_PORT', '3000')
  const rmqService = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(
    rmqService.getOption(QUEUE_SERVICE.API_SERVICE, true)
  )
  await app.startAllMicroservices()
  await app.listen(port, () => {
    console.log(`Api gateway listing on port ${port}`)
  })
}

void bootstrap()
