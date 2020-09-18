import { chromium, ChromiumBrowser, ChromiumBrowserContext, Page } from 'playwright';

const wait = async (interval) => {
  await new Promise(resolve => setTimeout(resolve, interval));
}

export class RicoCrawler {
  browser: ChromiumBrowser
  context: ChromiumBrowserContext
  page: Page
  username: string
  password: string
  // Values
  cashPositionbalance: number

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async buildBrowser() {
    this.browser = await chromium.launch({
      devtools: process.env.DEVTOOLS === '1',
      headless: false, // If false show the browser
    });

    this.context = await this.browser.newContext();
    console.log('Context created');
    this.page = await this.context.newPage();
    console.log('Page created');
  }

  async login() {
    console.log('Opening RICO');
    await this.page.goto('https://www.rico.com.vc/login/');
    await wait(1000);

    await this.page.fill("input.color-dove-grey", this.username);
    await this.page.click('text=Avançar');
    await wait(1000);
    await this.context.grantPermissions(['geolocation']);
    await wait(1000);

    await this.page.$eval('.KeyboardLogin__KeyboardContainer-foANRY', async (_e, pwd) => {

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      const $buttons = document.getElementsByClassName('KeyboardLogin__KeyboardButton-kZpsPe');
      const pwdDigits = pwd.split("");

      for (let i = 0; i < pwdDigits.length; i++) {
        await timeout(250);

        const dig = parseInt(pwdDigits[i]);

        for (let j = 0; j < $buttons.length; j++) {
          const $btn = $buttons[j] as HTMLElement;
          const txt = $btn.textContent;
          const numbers = txt.split("ou");

          if (numbers.length > 1) {
            const n1 = numbers[0];
            const n2 = numbers[1];

            if (parseInt(n1) === dig || parseInt(n2) === dig) {
              $btn.click();
            }
          }
        }
      }

      return pwd;
    }, this.password);

    await this.page.click('text=Acessar');


    const balanceNetwork = await this.page.waitForResponse('**/summary-position/');
    const summaryPositions = await balanceNetwork.json();

    // @ts-ignore
    this.cashPositionbalance = summaryPositions.positions[0].grossValue;

    try{
      await this.page.click('.introjs-skipbutton');
      await this.page.click('.ngdialog-close');
    }catch(e){}

    return this.cashPositionbalance;
  }

  async getTreasure() {
    const [responseCustody] = await Promise.all([
      this.page.waitForResponse('**/positions/'),
      this.page.goto("https://www.rico.com.vc/dashboard/tesouro-direto/"),
    ]);
    const response = await responseCustody.json();
    return response[0].positions;
  }

  async getStocks() {
    console.log('REQUEST');
    const [responseStocks] = await Promise.all([
      this.page.waitForResponse('**/stock-quote/**'),
      this.page.goto("https://www.rico.com.vc/dashboard/acoes/")
    ]);
    return responseStocks.json();
  }
}