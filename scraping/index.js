const puppeteer = require('puppeteer-extra');
const path = require('path');
const fsOperations = require('../filesystem/fs-operations')
const utils = require('../utils/utils')
const dom = require('./dom-functions')
const downloadPath = path.resolve('./download');


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function LoginCEI(page, limitAttempts = 5, attempts = 0) {
  
  try{
    await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx');
  }
  catch{
    console.log("Tentativa Recarregar a Pagina:"+attempts);
    if (attempts<5){
      return LoginCEI(page,limitAttempts,(attempts+1));
    }
    return false; 
  }

  try{
    await page.waitForFunction('window.location.pathname==="/CEI_Responsivo/home.aspx"', {timeout:0}); 
    await page.waitForTimeout(500); // Pensar em algo melhor para garantir login
    return true;
  }
  catch{
    return false;  
  }
}

async function GetB3Statement(page,pathSaveXls=''){

  await page.goto('https://cei.b3.com.br/CEI_Responsivo/extrato-bmfbovespa.aspx');
    
  const allInstituions = await page.evaluate(dom.domStatement.GetAllInstitutions)
  const instituionSelectSelector = 'select#ctl00_ContentPlaceHolder1_ddlAgentes'
  const dateSelectSelector = 'select#ctl00_ContentPlaceHolder1_ddlFiltroMes'
  const excelButtonSeletor = 'button#ctl00_ContentPlaceHolder1_btnVersaoEXCEL'
  
  for(institution of allInstituions){
  
    await page.select(instituionSelectSelector, institution.value);
    await page.waitForTimeout(500);
    const optDates = await page.evaluate(dom.domStatement.GetAllDates);
    
    for(date of optDates){
      await page.select(dateSelectSelector, date.value);
      await page.waitForTimeout(500);
      await page.click(excelButtonSeletor)
      const finalResponse = await page.waitForResponse(dom.domStatement.ReceivedXls)
      await page.waitForTimeout(1500);
      await fsOperations.putFileInPath(utils.nameXlsB3(date.name,date.value),utils.namePathB3(institution.name))
    }

    await page.goto('https://cei.b3.com.br/CEI_Responsivo/extrato-bmfbovespa.aspx');
    await page.waitForTimeout(1500);
  }

}

async function GetB3Transactions(page,pathSaveData=''){
  await page.goto('https://cei.b3.com.br/CEI_Responsivo/negociacao-de-ativos.aspx');
  // await page.waitForTimeout(1000)
  const allInstituions = await page.evaluate(dom.domTransactions.GetAllInstitutions)
  const instituionSelectSelector = 'select#ctl00_ContentPlaceHolder1_ddlAgentes'
  const transactionsImputSeletor = '#ctl00_ContentPlaceHolder1_btnConsultar' //ctl00_ContentPlaceHolder1_btnConsultar
  
  for(institution of allInstituions){
    
    await page.select(instituionSelectSelector, institution.value);
    await page.waitForTimeout(1000)
    await page.click(transactionsImputSeletor)
    page.waitForFunction(dom.domTransactions.ExistTableOrMsgAlert)
    await page.waitForTimeout(1000)
    const msgExist = await page.evaluate(dom.domTransactions.ExistMsgAlert)
    
    if (!msgExist){
      const dataTransactions = await page.evaluate(dom.domTransactions.GetStockTransactions)
      let data = JSON.stringify(dataTransactions);
      await fsOperations.SaveDataJson(data,institution.value+".json")
    }
      await page.reload();
  }
}
async function GetDataCEI()  {

  const browser = await puppeteer.launch(
    {headless: false,
      ignoreDefaultArgs: ["--enable-automation"] // disabilitando mensagens de controle do navegador *Iludindo o usuario*
    }
    );

    const page = await browser.newPage()

    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath // setando onde ira baixar os arquivos
    });


    if (await LoginCEI(page))
    {
      await GetB3Statement(page);
      await GetB3Transactions(page)
    }
  
    await browser.close();
};

GetDataCEI()