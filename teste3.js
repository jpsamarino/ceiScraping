const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
  console.log('Running tests..')
  const page = await browser.newPage()
//   await page.goto('https://bot.sannysoft.com') 
  await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'testresult.png', fullPage: true })
//   await browser.close()
  console.log(`All done, check the screenshot. ✨`)
})