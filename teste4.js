const fsPromises = require('fs').promises;

async function putFileInPath(endFileName,endPathName,orginPathName = './download',orginFileName = 'infoCei.xls'){   
    try{
        await fsPromises.mkdir(endPathName,{recursive:true}).then(console.log);
        await fsPromises.rename(orginPathName+"/"+orginFileName, endPathName+"/"+endFileName);
        return true;
    }
    catch{
        return false;
    }  
}
// putFileInPath('anaclara.xls','./BancoInter').then(console.log)