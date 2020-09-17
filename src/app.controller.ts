import { Controller, Get, Query } from '@nestjs/common';
// import { AppService } from './app.service';
import { RicoCrawler } from './lib/rico';

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Query('username') username, @Query('password') password): Promise<string> {
    const rico = new RicoCrawler(username, password);
    console.log('Build browser');
    await rico.buildBrowser();
    console.log('Build. Start login');
    await rico.login();

    console.log('Get stocks');
    const stocks = await rico.getStocks();

    console.log('done');

    return stocks;
  }
}
