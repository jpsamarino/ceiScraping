const fsPromises = require('fs').promises;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function replaceSpecialCaracters(stringInput){
    const re = /([!$%^&*()@#_+|~=`{}\[\]\\:";'<>?\/])/gi;
    return stringInput.replace(re, '-');
}
async function putFileInPath(endFileName, endPathName, orginPathName = './download',orginFileName = 'infoCEI.xls', attempts=0, limitAttempts = 10){   
    const rSC = replaceSpecialCaracters; 
    try{
        await fsPromises.access(orginPathName+"/"+orginFileName)
        await fsPromises.mkdir(endPathName,{recursive:true});
        await fsPromises.rename(orginPathName+"/"+orginFileName, endPathName+"/"+rSC(endFileName));
        return true;
    }
     catch{
         if (attempts<=limitAttempts){
            console.log(endPathName+"/"+rSC(endFileName)+" - tentativa:"+attempts);
            delay(1000); //espera 1 segundo para o navegador colocar o arquivo na pasta
            return putFileInPath(endFileName,endPathName,orginPathName,orginFileName,(attempts+1));
         }
         return false;
     }  
};

async function SaveDataJson(data, endFileName, endPathName='./BaseDados'){
    await fsPromises.mkdir(endPathName,{recursive:true});
    await fsPromises.writeFile(endPathName+"/"+replaceSpecialCaracters(endFileName),data,{recursive:true});
}

async function GetAllTypeFilesAddress(Path,typeF){
        let andress = [];
        const files = await fsPromises.readdir(Path)
        for (const file of files){

            const CompletePath = Path+"/"+ file;
            const Directory =  (await fsPromises.lstat(CompletePath))
            if(Directory.isDirectory()){
               const localAdress =  await GetAllXlsFilesAddress(CompletePath);
               andress = andress.concat(localAdress);
            }
            else{
                if(file.slice(-3).toLowerCase()===typeF.slice(-3).toLowerCase()){
                    andress.push(CompletePath)
                }
            }
        }
         
    return andress
}
async function GetAllXlsFilesAddress(Path){
   return (await GetAllTypeFilesAddress(Path,'xls'));
}
async function GetAllJsonFilesAddress(Path){
    return (await GetAllTypeFilesAddress(Path,'json'));
 }
async function FileToString(Path){
    return (await fsPromises.readFile(Path));
 }

async function FileJsonToVariable (Path){
    const rawdata = await fsPromises.readFile(Path);
    return (JSON.parse(rawdata));
 } 
 async function WriteinFile (File,data){
    return (await fsPromises.appendFile(File,data));
 }
  
//  WriteinFile('./teste.txt','ana paula issoé um teste')
// async function imprime(){
//    const bb=  await GetAllXlsFilesAddress('./Extratos B3')
//    console.log(bb)
// }
// imprime()
// const anaC ={
//     teste:'1223456767',
//     teste3:233,
//     teste44:233.334
// }

// SaveDataJson(JSON.stringify(anaC),'j.json')
exports.WriteInTxt = WriteinFile;
exports.SaveDataJson = SaveDataJson;
exports.putFileInPath = putFileInPath;
exports.GetAllXlsFilesAddress = GetAllXlsFilesAddress;
exports.GetAllJsonFilesAddress = GetAllJsonFilesAddress;
exports.FileToString = FileToString;
exports.FileJsonToVariable = FileJsonToVariable;