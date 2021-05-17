const XLSX = require('xlsx');
const fs = require('../filesystem/fs-operations');

function mapCustodyXslToObj(worksheet,objMap)
{
   
   const LineStart = (objMap.headLine).toString();
   posibleKeys = Object.entries(worksheet).filter(
       (v)=>{
        return XLSX.utils.decode_cell(v[0]).r === (objMap.headLine-1)
       }
       )
   console.log(posibleKeys)
}
function GetDataFromXls(file){

    let workbook = XLSX.readFile(file);
    let first_sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[first_sheet_name];
    
    
    const refCustodyNameExcel = {
        headLine: 20,
        column: {
            stockName: 'Ativo',
            obs: 'Especif.',
            mainCodeB3:'Cód. Neg.',
            amount: 'Saldo',
            priceInDay:'Cotação',
            totalPriceInDay:'Valor',
    
        }
    }
    mapCustodyXslToObj(worksheet,refCustodyNameExcel)


    const refCustodyExcel = {
        lineStart: 21,
        column: {
            stockName: 'F',
            obs: 'U',
            mainCodeB3:'AD',
            amount: 'AN',
            priceInDay:'AV',
            totalPriceInDay:'BC',
    
        }
    }
    
    const refEarningsExcel= {
        lineStart: null,
        column: {
            stockName: 'F',
            obs: 'V',
            mainCodeB3:'AL',
            amountEarning:'AY'
        }
    }
    const dateCustody = worksheet['F18'].v.slice(22); // Caracter init date
    
    let Agent = [];
    if(worksheet['Q11']){
        Agent = worksheet['Q11'].v.split(/(?<=\d) - /);
    }
    else{
        Agent = worksheet['P11'].v.split(/(?<=\d) - /);
    }

    const rCE = refCustodyExcel;
    let currentCell = worksheet[rCE.column.mainCodeB3+rCE.lineStart];
    let qtLines = 0;
    let Custody = []
    while(currentCell){
        const currentLine = {
            stockName: worksheet[rCE.column.stockName+(rCE.lineStart+qtLines)].v.trim(),
            obs: worksheet[rCE.column.obs+(rCE.lineStart+qtLines)].v,
            mainCodeB3:worksheet[rCE.column.mainCodeB3+(rCE.lineStart+qtLines)].v.trim(),
            amount: parseInt(worksheet[rCE.column.amount+(rCE.lineStart+qtLines)].v),
            priceInDay: worksheet[rCE.column.priceInDay+(rCE.lineStart+qtLines)].v,
            totalPriceInDay: worksheet[rCE.column.totalPriceInDay+(rCE.lineStart+qtLines)].v,
            date:dateCustody,
            codAgent: Agent[0],
            nameAgent:Agent[1]
        };
        Custody.push(currentLine);
        qtLines+=1;
        currentCell = worksheet[rCE.column.mainCodeB3+(rCE.lineStart+qtLines)];
    }
    
    const allFAddress = Object.keys(worksheet).filter((v)=>v.charAt(0)==='F');
    
    for(address of allFAddress){
        if (worksheet[address].v.includes('PROVENTOS EM DINHEIRO - CREDITADOS')){
            refEarningsExcel.lineStart = parseInt(address.slice(1))+2
            break
        }
    }
    
    Earnings = [];
    if(refEarningsExcel.lineStart){
        rEE = refEarningsExcel
        currentCell = worksheet[rEE.column.mainCodeB3+rEE.lineStart];
        qtLines = 0;
        
        while(currentCell){
            const currentLine = {
                stockName: worksheet[rEE.column.stockName+(rEE.lineStart+qtLines)].v.trim(),
                obs: worksheet[rEE.column.obs+(rEE.lineStart+qtLines)].v,
                mainCodeB3:worksheet[rEE.column.mainCodeB3+(rEE.lineStart+qtLines)].v.trim(),
                amountEarning: worksheet[rEE.column.amountEarning+(rEE.lineStart+qtLines)].v,
                date:dateCustody,
                codAgent: Agent[0],
                nameAgent:Agent[1]
            };
            Earnings.push(currentLine);
            qtLines+=1;
            currentCell = worksheet[rEE.column.mainCodeB3+(rEE.lineStart+qtLines)];
    
        }
    }

    return {
        date:dateCustody,
        codAgent: Agent[0],
        nameAgent:Agent[1],
        Custody,
        Earnings
    }

}

async function ProcessAllStatement(){
    const allXlsAddress = await fs.GetAllXlsFilesAddress('./Extratos B3');
    let statementData =[];
    for (address of allXlsAddress){
        console.log(address);
        const data = GetDataFromXls(address);
        statementData = statementData.concat(data);
        
    }
    console.log("Teste");

}
ProcessAllStatement()
teste = './Extratos B3/308 - CLEAR CORRETORA - GRUPO XP/ExtratoB3 2020-01-31 Janeiro-2020.xls'
// console.log(GetDataFromXls(teste))
// console.log("teste")