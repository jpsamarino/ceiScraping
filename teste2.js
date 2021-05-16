const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://v8.dev/blog/10-years');

  await page.emulateVisionDeficiency('achromatopsia');
  await page.screenshot({ path: 'achromatopsia.png' });

  await page.emulateVisionDeficiency('deuteranopia');
  await page.screenshot({ path: 'deuteranopia.png' });

  await page.emulateVisionDeficiency('blurredVision');
  await page.screenshot({ path: 'blurred-vision.png' });

  await browser.close();
})();
