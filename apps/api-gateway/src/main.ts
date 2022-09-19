import { RmqService } from '@app/common';
import { QUEUE_SERVICE } from '@app/common/typings/QUEUE_MESSAGE';
import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const app = await AppModule.create();
  const port = app.get(ConfigService).get<string>('PORT')
  const rmqServie = app.get<RmqService>(RmqService)
  app.connectMicroservice<RmqOptions>(rmqServie.getOption(QUEUE_SERVICE.API_SERVICE, true))
  await app.startAllMicroservices()
  await app.listen(port);
}
void bootstrap();
