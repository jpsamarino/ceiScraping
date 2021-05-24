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
            amount: parseInt(lineData[4][1].v.replace('.','')),
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
    const cnpjAndDatasArray = await fsOperations.FileJsonToVariable('./utils/cnpjData.json');
    const EarningsArray = await fsOperations.FileJsonToVariable('./BaseDados/dataEarnings.json');
    const EarningsArrayF = EarningsArray.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/01/2020') && util.dateBr(v.date)<util.dateBr('01/01/2021'))).sort(CompareTransctionsSort)
    const EarningsYear = {}
    EarningsArrayF.forEach(v=>{

         if(EarningsYear[v.mainCodeB3]){
            EarningsYear[v.mainCodeB3].amount+=v.amountEarning
         }
         else{
            const dados = {
                mainCodeB3:v.mainCodeB3,
                amount:v.amountEarning,
                stockName:v.stockName
                };
                EarningsYear[v.mainCodeB3] = dados;
         }

     })

    const cnpjAndDatas = {};
    cnpjAndDatasArray.arrayData.forEach(v=>{
       const dados = {
        mainCodeB3:v[0],
        cnpj:v[2],
        stockName:v[0]
        };
        cnpjAndDatas[v[0]] = dados;
    })
    const getCNPJ = mainCodeB3=> cnpjAndDatas[mainCodeB3]?cnpjAndDatas[mainCodeB3].cnpj:"*****";
    
    const dataFilter = dataCustody.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/12/2019') && util.dateBr(v.date)<util.dateBr('01/06/2021')))



    const objCustodyOp= CreateObjCustody(dataCustody.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/12/2019') && util.dateBr(v.date)<util.dateBr('01/01/2020'))))
    const objCustodyC= CreateObjCustody(dataCustody.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/12/2020') && util.dateBr(v.date)<util.dateBr('01/01/2021'))))
    
    const tab = String.fromCharCode(9);
    const aqCustodia = './BaseDados/saidaCustodia.txt';
    const aqOperacoes = './BaseDados/saidaOperacoes.txt';
    const aqDividendos = './BaseDados/saidaDividendos.txt';
    const aqDividendosA = './BaseDados/saidaDividendosA.txt';

    for (keyV of Object.keys(EarningsYear))
    {   const valor = EarningsYear[keyV];
        const amount =  String(valor.amount).replace(".",",");
        const imprime = valor.stockName+tab+valor.mainCodeB3+tab+getCNPJ(valor.mainCodeB3)+tab+amount+tab+"\n";
        await fsOperations.WriteInTxt(aqDividendosA,imprime)
    }

    for (valor of EarningsArrayF)
    {   
        const amount =  String(valor.amountEarning).replace(".",",");
        const imprime = valor.stockName+tab+valor.mainCodeB3+tab+getCNPJ(valor.mainCodeB3)+tab+amount+tab+valor.date+"\n";
        await fsOperations.WriteInTxt(aqDividendos,imprime)
    }
    
    const CustodyC = objCustodyC[Object.keys(objCustodyC)[0]]
    for (keyV of Object.keys(CustodyC))
    {
        const valor = CustodyC[keyV];
        const imprime = valor.stockName+tab+keyV+tab+getCNPJ(keyV)+tab+valor.amount+tab+"0"+tab+valor.date+"\n";
        await fsOperations.WriteInTxt(aqCustodia,imprime)
    }

    const CustodyOp = objCustodyC[Object.keys(objCustodyC)[0]]
    for (keyV of Object.keys(CustodyOp))
    {
        const valor = CustodyOp[keyV];
        const imprime = valor.stockName+tab+keyV+tab+getCNPJ(keyV)+tab+valor.amount+tab+"0"+tab+valor.date+"\n";
        await fsOperations.WriteInTxt(aqOperacoes,imprime)
    }
    
    const transactionsf = await fsOperations.FileJsonToVariable('./BaseDados/transactions.json');
    const transactions = transactionsf.filter(v=> (util.dateBr(v.date)>=util.dateBr('01/01/2020') && util.dateBr(v.date)<util.dateBr('28/12/2020'))).sort(CompareTransctionsSort)
    
    for (valor of transactions)
    {   const amount = valor.buySell=='C'?valor.amount:-valor.amount;
        const imprime = valor.stockName+tab+valor.mainCodeB3+tab+getCNPJ(valor.mainCodeB3)+tab+amount+tab+valor.unitaryPrice+tab+valor.date+"\n";
        await fsOperations.WriteInTxt(aqOperacoes,imprime)
    }

    const strangeOperations = await DiscoverStrangeOperations(dataFilter);
    const keysSO = Object.keys(strangeOperations).filter(v=> (util.dateBr(v)>=util.dateBr('01/01/2020') && util.dateBr(v)<util.dateBr('28/12/2020')));
    
    for (key of keysSO)
    {   
        const cods = Object.keys(strangeOperations[key]);
        for(cod of cods){
            if(strangeOperations[key][cod]>0){
                date = key.split('-');
                const imprime = "******"+tab+cod+tab+"******"+tab+strangeOperations[key][cod]+tab+'0'+tab+('01/'+date[1]+'/'+date[0])+"\n";
                await fsOperations.WriteInTxt(aqOperacoes,imprime)
            }
        }

    }

    return true
}
async function DiscoverStrangeOperations(arrayCustody)
{
    const sortArray = arrayCustody.sort(CompareCustodySort)
    const balanceM = [];

    const result = CreateObjCustody(sortArray);
    const Amount  = CreateObjAmount(result);
    console.log(Amount);
    const transactionsf = await fsOperations.FileJsonToVariable('./BaseDados/transactions.json');
    const transactions  =  ResumeTransactionsMonth(transactionsf)
    console.log(transactions);
    const StrangeOperations = CompareCustodyWithTransactions(transactions,Amount)
    
    return StrangeOperations
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
function CreateObjCustody(ArrayCustody){ //join
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
                    codAgent: [Custody.codAgent],
                    date:Custody.date
                }
            }
        }
        else{
            ProcessedCustody[dateRef] ={
                [Custody.mainCodeB3]: {
                        stockName:Custody.stockName,
                        amount:Custody.amount,
                        codAgent: [Custody.codAgent],
                        date:Custody.date
                }
            }
        }
    }
    return ProcessedCustody;
}
function CompareCustodySort(valueA, valueB, inverse = true) {  //data decrease and name cresent
    const inverterDate = inverse?1:-1;
    if (util.dateBr(valueA.date)<util.dateBr(valueB.date)) {
        return 1*inverterDate;
    }
    if (util.dateBr(valueA.date)>util.dateBr(valueB.date)) {
        return -1*inverterDate;
    }
    if(valueA.mainCodeB3>valueB.mainCodeB3){
        return 1;
    }
    if(valueA.mainCodeB3<valueB.mainCodeB3){
        return -1;
    }
    return 0;
}
function CompareTransctionsSort(valueA, valueB){
    return CompareCustodySort(valueA, valueB, false)
}
function ResumeTransactionsMonth(arrayTransactions){
    
    const ProcessedTransactions = {}

    for (Transaction of arrayTransactions){
        const buySell = Transaction.buySell==='C'?1:-1;
        const dateRef = util.dateBr(Transaction.date,true,2); // b3 trabalha com d+2 para efetivar um transação

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
function CompareCustodyWithTransactions (transactionsM,custodyM,residualBalanceInput={}){
    //Função com varios problemas foi feito uma gambiarra para o saldo  (Arrumar depois)
    
    const diferences = {};
    const dates = Object.keys(custodyM).sort(); // Necessario ordenar para conferencia (sem isso n funciona)
    
    const residualBalance = Object.assign({ok:'ok'}, transactionsM) //copy obj
    Object.keys(residualBalance).forEach(date=>residualBalance[date]=Object.assign({}, residualBalance[date]))//copy obj

    for(indexDate in dates){
        const date = dates[indexDate];
        const mainCodesB3 = Object.keys(custodyM[date]);

        for(mainCodeB3 of mainCodesB3){
            if(transactionsM[date][mainCodeB3]){

                let beforeBalanceAmount = residualBalanceInput[dates[indexDate-1]]?residualBalanceInput[dates[indexDate-1]][mainCodeB3]:0;
                beforeBalanceAmount=beforeBalanceAmount?beforeBalanceAmount:0;

                let afterBalanceAmount = residualBalanceInput[dates[indexDate+1]]?residualBalanceInput[dates[indexDate+1]][mainCodeB3]:0;
                afterBalanceAmount=afterBalanceAmount?beforeBalanceAmount:0;

                if (beforeBalanceAmount||afterBalanceAmount) {
                    console.log(1)
                }

                let diferenceAmount = custodyM[date][mainCodeB3] - transactionsM[date][mainCodeB3];
                if(diferenceAmount!=0){

                    if((diferenceAmount-beforeBalanceAmount-afterBalanceAmount)!=0){ //Verifica se algum saldo compensa a diferença
                        
                        if(!diferences[date]){
                            diferences[date] ={};
                        }
    
                        diferences[date][mainCodeB3] = diferenceAmount;
                        residualBalance[date][mainCodeB3] = -diferenceAmount;
                    }
                    else{
                        delete residualBalance[date][mainCodeB3];
                    }
                    
                }

                else{
                    delete residualBalance[date][mainCodeB3];
                }

            }
            else if(custodyM[date][mainCodeB3]>0){

                if(!diferences[date]){
                    diferences[date] ={};
                }

                diferences[date][mainCodeB3] = custodyM[date][mainCodeB3];

            }
        }
    }
    
    if (Object.keys(residualBalanceInput).length>0 || Object.keys(residualBalance).length==0){
        return diferences
    }
    else{
        return CompareCustodyWithTransactions(transactionsM,custodyM,residualBalance)
    }
    
}


(async()=>{
    // await ProcessAllStatement();
    // await ProcessAllTransactions();
    await AveragePriceResult();
})();
// ProcessAllStatement()
//  AveragePriceResult()
//ProcessAllTransactions()
// ProcessAllStatement()
