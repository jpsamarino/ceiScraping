

function nameXlsOfStatementB3(description,datePt){
    return "ExtratoB3 "+datePtBrToStandard(datePt)+" "+description+".xls"
};

function namePathOfStatementB3(institution){
    return "./Extratos B3/"+institution.replace(/([./\\])/g,'')
};

function datePtBrToStandard(ptDate)
{
const splitData = ptDate.split(/[\/ ]/);
if(splitData.length > 2){
    return (splitData[2]+"-"+splitData[1]+"-"+splitData[0]);
    } 
    return ptDate
};
exports.nameXlsB3 = nameXlsOfStatementB3;
exports.namePathB3 = namePathOfStatementB3;