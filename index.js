const a = require('./scraping');
// const puppeteer = require('puppeteer-extra');
// const path = require('path');
// const fsOperations = require('./filesystem/fs-operations')
// const utils = require('./utils/utils')
// const downloadPath = path.resolve('./download');


// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// (async () => {
//   const browser = await puppeteer.launch(
//     {headless: false,
//       ignoreDefaultArgs: ["--enable-automation"]
//     }
//     );

//     const page = await browser.newPage()

//     await page._client.send('Page.setDownloadBehavior', {
//       behavior: 'allow',
//       downloadPath: downloadPath 
//     });

//     await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx')
//     await page.waitForFunction('window.location.pathname==="/CEI_Responsivo/home.aspx"', {timeout:0});
//     await page.waitForTimeout(5000);
//     await page.goto('https://cei.b3.com.br/CEI_Responsivo/extrato-bmfbovespa.aspx');
    
//     const options = await page.$$eval('select#ctl00_ContentPlaceHolder1_ddlAgentes', (options) =>
//     options.map((option) => option.innerHTML) // Lembrar q eu tenho q pegar os filhos
//     );

//     const institutionSelector = 'select#ctl00_ContentPlaceHolder1_ddlAgentes';
//     const optSelectionInstituions = await page.evaluate(() =>{
//       const selectionInst = [...document.querySelector('select#ctl00_ContentPlaceHolder1_ddlAgentes').children]
//       return selectionInst.map(opt=>{const obj = {name:opt.innerText,value:opt.value};  return obj})
//     }).then((allObj)=>allObj.filter(obj=>obj.value>0));

//     for(institution of optSelectionInstituions){
      
//       await page.select('select#ctl00_ContentPlaceHolder1_ddlAgentes', institution.value);
//       await page.waitForTimeout(1500);
      
//       const optDates = await page.evaluate(() =>{
//         const selectionDate = [...document.querySelector('select#ctl00_ContentPlaceHolder1_ddlFiltroMes').children]
//         return selectionDate.map(opt=>{const obj = {name:opt.innerText,value:opt.value};  return obj})
//       });
      
//       for(date of optDates){
//         await page.select('select#ctl00_ContentPlaceHolder1_ddlFiltroMes', date.value);
//         await page.waitForTimeout(500);
//         await page.click('button#ctl00_ContentPlaceHolder1_btnVersaoEXCEL')
//         const finalResponse = await page.waitForResponse(
//           (resp) => resp.url() === 'https://cei.b3.com.br/Relatorio/Renderizar.aspx' && resp.status() === 200
//         )
//         await page.waitForTimeout(500);
//         await fsOperations.putFileInPath(utils.nameXlsB3(date.name,date.value),utils.namePathB3(institution.name))
//       }

//       await page.goto('https://cei.b3.com.br/CEI_Responsivo/extrato-bmfbovespa.aspx');
//       await page.waitForTimeout(1500);
//     }

    
//     await browser.close();
//     console.log("teste")
// })();


