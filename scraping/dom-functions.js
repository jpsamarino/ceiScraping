function TExistMsgAlert(){
    const selector ='.alert-box.success';
    return document.querySelector(selector)!==null;
}
function TExistTable(){
    const selector ='#ctl00_ContentPlaceHolder1_rptAgenteBolsa_ctl00_rptContaBolsa_ctl00_pnAtivosNegociados';
    return document.querySelector(selector)!==null;
}
function TExistTableOrMsgAlert(){
    const selectorTable ='#ctl00_ContentPlaceHolder1_rptAgenteBolsa_ctl00_rptContaBolsa_ctl00_pnAtivosNegociados';
    const selectorMsg ='.alert-box.success';
    const isTable = document.querySelector(selectorTable)!==null;
    const isMsg = document.querySelector(selectorMsg)!==null;
    console.log("isTable: "+isTable+" isMsg: "+isMsg);
    return isTable||isMsg
}
function TNotExistTable(){
    const selector ='#ctl00_ContentPlaceHolder1_rptAgenteBolsa_ctl00_rptContaBolsa_ctl00_pnAtivosNegociados';
    return document.querySelector(selector)===null;
}
function TImputIsAvaliable(){
    const selector = '#ctl00_ContentPlaceHolder1_btnConsultar'
    if (document.querySelector(selector)===null){
        return null
    }
    return document.querySelector(selector).value === 'Consultar'
}
function TGetStockTransactions(){

    const headSelector = '#ctl00_ContentPlaceHolder1_rptAgenteBolsa_ctl00_rptContaBolsa_ctl00_pnAtivosNegociados table.responsive thead tr th'
    const headElementsMoviments = document.querySelectorAll(headSelector)
    const headMoviments = [...headElementsMoviments].map((v)=>v.innerText)

    const bodySelector = '#ctl00_ContentPlaceHolder1_rptAgenteBolsa_ctl00_rptContaBolsa_ctl00_pnAtivosNegociados table.responsive tbody tr'
    const bodyElementsMoviments = document.querySelectorAll(bodySelector)
    const bodyMoviments = [...bodyElementsMoviments].map((v)=>{
        const arrayData = v.innerText.split('\t');
        const objExit = {
            date:arrayData[0],
            buySell:arrayData[1],
            typeMarket:arrayData[2],
            dueDate:arrayData[3],
            codeB3:arrayData[4],
            stockName:arrayData[5],
            amount:arrayData[6],
            unitaryPrice:arrayData[7],
            totalPrice:arrayData[8],
            quotationFactor:arrayData[9],
            mainCodeB3:arrayData[4].replace(/[fF]$/,'')

        };
        return objExit
    })

    const stockTransactions = {
    headPt:headMoviments,
    data:bodyMoviments
    }

    return stockTransactions
}
function GetAllInstitutions(){
    const selector = 'select#ctl00_ContentPlaceHolder1_ddlAgentes option';
    const allOptions= [...document.querySelectorAll(selector)].map((option) => {return {name:option.innerText,value:option.value}});
    const allInstitutions = allOptions.slice(1); // primeira op não é uma insituição
    return allInstitutions
}
function GetAllAccounts(){
    const selector = 'select#ctl00_ContentPlaceHolder1_ddlContas option';
    const allAccounts= [...document.querySelectorAll(selector)].map((option) => {return {name:option.innerText,value:option.value}});
    return allAccounts
}
function SgetAllDates(){
    const selector = 'select#ctl00_ContentPlaceHolder1_ddlFiltroMes option';
    const allDates= [...document.querySelectorAll(selector)].map((option) =>  {return {name:option.innerText,value:option.value}});
    return allDates
}
function SreceivedXls(ans){
    return ans.url() === 'https://cei.b3.com.br/Relatorio/Renderizar.aspx' && ans.status() === 200
}

const domStatement = {
    GetAllInstitutions,
    GetAllAccounts,
    GetAllDates:SgetAllDates,
    ReceivedXls:SreceivedXls
}

const domTransactions = {
    GetAllInstitutions,
    GetAllAccounts,
    GetStockTransactions:TGetStockTransactions,
    ExistTable:TExistTable,
    NotExistTable:TNotExistTable,
    ExistMsgAlert:TExistMsgAlert,
    ImputIsAvaliable:TImputIsAvaliable,
    ExistTableOrMsgAlert:TExistTableOrMsgAlert
}

exports.domStatement = domStatement;
exports.domTransactions = domTransactions;