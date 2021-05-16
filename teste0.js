const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch(
    {  args: ['--no-sandbox'], headless: false }
    );
  const page = await browser.newPage();
  await page.setViewport({
    width: 1300,
    height: 800,
    deviceScaleFactor: 1,
  });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        

  await page.waitForTimeout(1000);
  await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx');
//  try{
//   await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx',{timeout:1000});}
//   catch{
//   console.log("erro");
//   await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx');
// }
  // page.on('request',(e)=>{console.log("\n*****************request*************************"); console.log(e.response()+": "+e.resourceType()+": "+ e.url());});
  // page.on('close',()=>console.log("Fechou"));
  // page.on('console', (msg) => {
  //   for (let i = 0; i < msg.args().length; ++i)
  //     console.log(`${i}: ${msg.args()[i]}`);
  // });
  // await page.evaluate(() => console.log('hello', 5, { foo: 'bar' }));
  const targett = page.target();
  const url = page.mainFrame().url();
  const titlee = await page.title();
  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"+targett.url()+"**"+titlee+"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  
  await page.waitForFunction('window.location.pathname==="/CEI_Responsivo/home.aspx"', {timeout:0});
console.log("ZZZZZZZZZZZZZZZZZZZZZZZZ  Esperou e entrou em:"+page.mainFrame().url())
await page.waitForTimeout(10000);
try{
  console.log("teste")
await page.click('a[href="extrato-bmfbovespa.aspx"]');
}
catch{
  console.log("erro");
  await page.goto('https://cei.b3.com.br/CEI_Responsivo/extrato-bmfbovespa.aspx');
}
// await page.waitForNavigation();
await page.waitForTimeout(3000);
const options = await page.$$eval('select#ctl00_ContentPlaceHolder1_ddlAgentes', (options) =>
  options.map((option) => option.innerHTML) // Lembrar q eu tenho q pegar os filhos
);
console.log(options)
console.log(options[0])
// await page.waitForTimeout(2000);
//    await page.close()
//   // // await page.waitForNavigation({waituntil:"networkidle2"})
//   // // await page.screenshot({ path: 'example.png' });
//   // // await page.evaluate(() => console.log(`url is ${location.href}`));

//   await browser.close();
})();