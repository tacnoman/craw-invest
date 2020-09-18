import { Controller, Get, Query } from '@nestjs/common';
// import { AppService } from './app.service';
import { RicoCrawler } from './lib/rico';
import { SpreadSheet } from './lib/spreadsheet';

@Controller()
export class AppController {
  @Get()
  async getHello(@Query('username') username, @Query('password') password): Promise<string> {
    const rico = new RicoCrawler(username, password);
    console.log('Build browser');
    await rico.buildBrowser();
    console.log('Build. Start login');
    await rico.login();

    console.log('Get stocks');
    const stocks = await rico.getStocks();

    const sheet = new SpreadSheet();
    await sheet.load();
    await sheet.buildDays();

    for(let i = 0; i < stocks.length; i++) {
      const currentStock = stocks[i];
      const stockName = currentStock.symbol;
      const value = currentStock.currentUnitValue * currentStock.currentSellQuantity;

      console.log('Stock: ', stockName, ' - Value: ', value);
      await sheet.setStock(stockName, value);
      await sheet.saveSpread()
    };

    return stocks;
  }
}
