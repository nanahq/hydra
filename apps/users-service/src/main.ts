import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module';
import {RmqService} from '@app/common'
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE';
async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);
  const rmq = app.get<RmqService>(RmqService)
  app.connectMicroservice(rmq.getOption(QUEUE_SERVICE.USERS_SERVICE))
  await app.startAllMicroservices()
}
(() => {
  bootstrap()
  .then(() => console.log('users-service listing'))
  .catch(() => console.log('users-service failed to start')
  )
})();
