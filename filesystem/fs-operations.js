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

// const anaC ={
//     teste:'1223456767',
//     teste3:233,
//     teste44:233.334
// }

// SaveDataJson(JSON.stringify(anaC),'j.json')
exports.SaveDataJson = SaveDataJson;
exports.putFileInPath = putFileInPath;