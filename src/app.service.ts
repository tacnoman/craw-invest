import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { RicoCrawler } from './lib/rico';
import { SpreadSheet } from './lib/spreadsheet';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @Command({ command: 'stocks', describe: 'For today' })
  async stocks() {
    const username = process.env.RICO_USERNAME;
    const password = process.env.RICO_PASSWORD;

    if (!username || !password) {
      throw new Error('You must set RICO_USERNAME and RICO_PASSWORD');
    }

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
