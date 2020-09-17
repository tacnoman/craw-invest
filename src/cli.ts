import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { CoreModule } from './core/core.module';

(async () => {
  const app = await NestFactory.createApplicationContext(CoreModule, {
    logger: false // no logger
  });
  app.select(CommandModule).get(CommandService).exec();
})();
