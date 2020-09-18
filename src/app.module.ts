import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CommandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
