const XLSX = require('xlsx');
const fsOperations = require('../filesystem/fs-operations');

function getRowdata(worksheet,line){
    return Object.entries(worksheet).filter((v)=>XLSX.utils.decode_cell(v[0]).r === (line-1))
}

function GetDataFromXls(file){
    let workbook = XLSX.readFile(file);
    let first_sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[first_sheet_name];
    
    let Agent = [];
    const initialLineHead = getRowdata(worksheet,11)
    
    if (initialLineHead.length == 0) // não existe nome
    {
        return null
    }

    Agent = initialLineHead[1][1].v.split(/(?<=\d) - /);

    const lineDate = getRowdata(worksheet,18)

    const dateCustody = lineDate[0][1].v.slice(22); // Caracter init date

    let cLine = 21;
    let lineData = getRowdata(worksheet,cLine)
    let Custody = []

    while(lineData.length==7){
        const currentLine = {
            stockName: lineData[0][1].v.trim(),
            obs: lineData[1][1].v.trim(),
            mainCodeB3:lineData[3][1].v.trim(),
            amount: parseInt(lineData[4][1].v),
            priceInDay: lineData[5][1].v,//worksheet[rCE.column.priceInDay+(rCE.lineStart+qtLines)].v,
            totalPriceInDay: lineData[6][1].v,
            date:dateCustody,
            codAgent: Agent[0],
            nameAgent:Agent[1]
        };
        Custody.push(currentLine);
        cLine+=1;
        lineData = getRowdata(worksheet,cLine);
    }
    //console.log(Custody)

    const allFAddress = Object.keys(worksheet).filter((v)=>v.charAt(0)==='F');
    for(address of allFAddress){
        if (worksheet[address].v.includes('PROVENTOS EM DINHEIRO - CREDITADOS')){
            cLine = parseInt(address.slice(1))+2
            break
        }
    }
    
    lineData = getRowdata(worksheet,cLine);
    Earnings = [];

    while(lineData.length==5){
        const currentLine = {
            stockName: lineData[0][1].v.trim(),
            obs: lineData[1][1].v.trim(),
            mainCodeB3:lineData[3][1].v.trim(),
            amountEarning:lineData[4][1].v,
            date:dateCustody,
            codAgent: Agent[0],
            nameAgent:Agent[1]
        };
        Earnings.push(currentLine);
        cLine+=1;
        lineData = getRowdata(worksheet,cLine);
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
    const allXlsAddress = await fsOperations.GetAllXlsFilesAddress('./Extratos B3');
    let statementData =[];
    let earnings = [];
    let custody = [];
    for (address of allXlsAddress){
        console.log(address);
        const data = GetDataFromXls(address);
        if(data){
            statementData = statementData.concat(data);
            earnings = earnings.concat(data.Earnings)
            custody = custody.concat(data.Custody)
        }
        
    }
    console.log(statementData);
    const xlsProcess = {
        statementData,
        earnings,
        custody
    }
    let data = JSON.stringify(xlsProcess);
    await fsOperations.SaveDataJson(data,"statementData.json")
}
ProcessAllStatement()
