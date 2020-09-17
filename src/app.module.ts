import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, CommandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
