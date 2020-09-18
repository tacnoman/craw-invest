import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class SpreadSheet {
  doc: GoogleSpreadsheet
  sheet: GoogleSpreadsheetWorksheet
  constructor() {
    console.log(process.env.GOOGLE_SPREADSHEET_URL_ID);
    this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_URL_ID);
  }

  getSpreadTitle() {
    const date = new Date();
    return `Mês ${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  async getSpreadSheet(): Promise<GoogleSpreadsheetWorksheet> {
    if (!this.sheet) {
      const title = this.getSpreadTitle();
      this.sheet = this.doc.sheetsByTitle[title];
      if (!this.sheet)  {
        this.sheet = await this.doc.addSheet({ title });
      }

      await this.sheet.loadCells(null);
    }

    return this.sheet;
  }

  async load() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const credentials = require('../../credentials.json');
    await this.doc.useServiceAccountAuth(credentials);
    await this.doc.loadInfo();
  }

  async buildDays() {
    const sheet = await this.getSpreadSheet();

    const date = new Date();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const cell = sheet.getCell(i, 0);
      cell.value = `${i.toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    await sheet.saveUpdatedCells();
  }

  async setStock(stockName: string, value: number) {
    let columnIndex = null;
    const sheet = await this.getSpreadSheet();

    for(let i = 1; i < 26; i++) {
      const cell = sheet.getCell(0, i);
      if (cell.value === stockName || cell.value === null) {
        columnIndex = i;

        cell.value = stockName;
        break;
      }
    }
    if (!columnIndex) throw new Error('Dont have any space to this stock');

    const date = new Date();
    const rowIndex = date.getDate();

    const cellValue = sheet.getCell(rowIndex, columnIndex);
    cellValue.value = value;
  }

  async saveSpread() {
    const sheet = await this.getSpreadSheet();
    await sheet.saveUpdatedCells();
  }
}
