const XLSX = require('xlsx');
const fsOperations = require('../filesystem/fs-operations');
const util = require('../utils/utils')

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
    let dataEarnings = JSON.stringify(earnings);
    let dataCustody = JSON.stringify(custody);
    await fsOperations.SaveDataJson(dataEarnings,"dataEarnings.json").catch(console.log);
    await fsOperations.SaveDataJson(dataCustody,"dataCustody.json").catch(console.log);
}

async function ProcessAllTransactions(){
    const allJsonAddress = await fsOperations.GetAllJsonFilesAddress('./BaseDados/transactions');
    transactions = [];

    for (address of allJsonAddress){
        console.log(address);
        const data = await fsOperations.FileJsonToVariable(address);
        if(data){
            transactions = transactions.concat(data);
        }
    }
    let dataTransactions = JSON.stringify(transactions);
    await fsOperations.SaveDataJson(dataTransactions,"transactions.json").catch(console.log);
}

async function AveragePriceResult(){
    const dataCustody = await fsOperations.FileJsonToVariable('./BaseDados/dataCustody.json');
    const dataFilter = dataCustody.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/12/2019') && util.dateBr(v.date)<util.dateBr('01/06/2021')))
    const a = await CalculateBalanceMonth(dataFilter)
    // const saida = dataFilter.reduce((array,value)=>[...array,util.dateBr(value.date)],[])
    // console.log(saida.sort());
    return a
}
async function CalculateBalanceMonth(arrayCustody)
{
    const sortArray = arrayCustody.sort(CompareCustodySort)
    const balanceM = [];

    console.log(util.dateSrtPtBrToDate('25/10/2015'));
    console.log(util.dateSrtPtBrToDate('25/10/2015',true));
    console.log(util.dateBr('25/10/2015'));
    console.log(util.dateBr('25/10/2015',true));

    const result = CreateObjCustody(sortArray);
    const Amount  = CreateObjAmount(result);
    console.log(Amount);
    const transactionsf = await fsOperations.FileJsonToVariable('./BaseDados/transactions.json');
    const transactions  =  ResumeTransactionsMonth(transactionsf)
    console.log(transactions);
    
    return true
}
function CreateObjAmount(ObjCustody){
    
    const CreateObjBalance = (obj)=>{
        const exitObj = {};
        const keys = Object.keys(obj);
        for(key of keys){
            exitObj[key] =  obj[key].amount
        }
        return exitObj
    }

    const dates = Object.keys(ObjCustody).sort();
    const objAmount = {[dates[0]]:CreateObjBalance(ObjCustody[dates[0]])}

    for (indexDate in dates){
        if(!objAmount[dates[indexDate]]){
            objAmount[dates[indexDate]] = CreateObjBalance(ObjCustody[dates[indexDate]]) // depois temos q clonar 
            const beforeStocks = Object.keys(ObjCustody[dates[indexDate-1]])
            
            for (stock of beforeStocks){
                if(ObjCustody[dates[indexDate]][stock]){
                    objAmount[dates[indexDate]][stock] -= ObjCustody[dates[indexDate-1]][stock].amount;
                }
                else{
                    objAmount[dates[indexDate]][stock]=-ObjCustody[dates[indexDate-1]][stock].amount;
                }

            }

        }
    }

    return objAmount
}
function CreateObjCustody(ArrayCustody){
    const ProcessedCustody = {}
    for (Custody of ArrayCustody){

        const dateRef = util.dateBr(Custody.date,true);
        if(ProcessedCustody[dateRef]){
            if(ProcessedCustody[dateRef][Custody.mainCodeB3]){
                ProcessedCustody[dateRef][Custody.mainCodeB3].amount += Custody.amount;
                ProcessedCustody[dateRef][Custody.mainCodeB3].codAgent.push(Custody.codAgent);
            }
            else{
                ProcessedCustody[dateRef][Custody.mainCodeB3] = {
                    stockName:Custody.stockName,
                    amount:Custody.amount,
                    codAgent: [Custody.codAgent]
                }
            }
        }
        else{
            ProcessedCustody[dateRef] ={
                [Custody.mainCodeB3]: {
                        stockName:Custody.stockName,
                        amount:Custody.amount,
                        codAgent: [Custody.codAgent]
                }
            }
        }
    }
    return ProcessedCustody;
}
function CompareCustodySort(valueA, valueB) {  //data decrease and name cresent
    if (util.dateBr(valueA.date)<util.dateBr(valueB.date)) {
        return 1;
    }
    if (util.dateBr(valueA.date)>util.dateBr(valueB.date)) {
        return -1;
    }
    if(valueA.mainCodeB3>valueB.mainCodeB3){
        return 1;
    }
    if(valueA.mainCodeB3<valueB.mainCodeB3){
        return -1;
    }
    return 0;
}

function ResumeTransactionsMonth(ArrayTransactions){
    
    const ProcessedTransactions = {}

    for (Transaction of ArrayTransactions){
        const buySell = Transaction.buySell==='C'?1:-1;
        const dateRef = util.dateBr(Transaction.date,true,2); // b3 trabalha com d+2

        if(ProcessedTransactions[dateRef]){
            if(ProcessedTransactions[dateRef][Transaction.mainCodeB3]){
                ProcessedTransactions[dateRef][Transaction.mainCodeB3] += (Transaction.amount*buySell);
            }
            else{
                ProcessedTransactions[dateRef][Transaction.mainCodeB3] = (Transaction.amount*buySell);
            }
        }
        else{
            ProcessedTransactions[dateRef] ={
                [Transaction.mainCodeB3]: (Transaction.amount*buySell)
            }
        }
    }
    return ProcessedTransactions;
}

AveragePriceResult()
//ProcessAllTransactions()
// ProcessAllStatement()
