

function nameXlsOfStatementB3(description,datePt){
    return "ExtratoB3 "+datePtBrToStandard(datePt)+" "+description+".xls"
};

function namePathOfStatementB3(institution){
    return "./Extratos B3/"+institution.replace(/([./\\])/g,'')
};

function datePtBrToStandard(ptDate, groupMonth = false , daysAdd = 0)
{   
    const splitData = ptDate.split(/[\/ ]/);
    if(splitData.length > 2){
        
        let month = splitData[1];
        let year = splitData[2];
        let day = splitData[0];

        if(daysAdd>0){
            //Deve cair sempre em um dia util
            const dtref = new Date(splitData[2],Number(splitData[1])-1,Number(splitData[0]));
            dtref.setDate(dtref.getDate() + daysAdd);
            if(dtref.getDay()==0){ 
                dtref.setDate(dtref.getDate() + 1); //caso domingo
            }
            else if(dtref.getDay()==6){ 
                dtref.setDate(dtref.getDate() + 2); //caso Sabado    
            }

            month = ("0"+(dtref.getMonth()+1)).slice (-2);
            year = dtref.getFullYear();
            day = ("0"+(dtref.getDate())).slice (-2);
        }

        if(!groupMonth){
            return (year+"-"+month+"-"+day);
        }
        else if(groupMonth){
            return (year+"-"+month);
        } 

    }
    return ptDate
};

function dateSrtPtBrToDate(ptDate, groupMonth = false, daysAdd = 0){

    const splitData = ptDate.split(/[\/ ]/);
    if(splitData.length > 2 && groupMonth){
        return new Date(splitData[2],Number(splitData[1])-1)
    }
    else if(splitData.length > 2 && !groupMonth){
        return new Date(splitData[2],Number(splitData[1])-1,Number(splitData[0]))
    }
    return false
}


exports.nameXlsB3 = nameXlsOfStatementB3;
exports.namePathB3 = namePathOfStatementB3;
exports.dateBr = datePtBrToStandard;
exports.dateSrtPtBrToDate = dateSrtPtBrToDate;