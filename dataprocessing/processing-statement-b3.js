// const XLSX = require('xlsx')
// var wb = XLSX.readFile('./Extratos B3/308 - CLEAR CORRETORA - GRUPO XP/ExtratoB3 2020-01-31 Janeiro-2020.xlsx');
// //console.log(workbook.Workbook.Names())
// var ws_name = wb.SheetNames[0];
// var ws = wb.Sheets[ws_name];
// ws["A1"] = {
//     t: 's', // <-- t: 's' indicates the cell is a text cell
//     v: "HI" // <-- v holds the value
//   };
//   XLSX.writeFile(wb, "./new.xlsx");

const XLSX = require('xlsx');

// read from a XLS file
let workbook = XLSX.readFile('./Extratos B3/308 - CLEAR CORRETORA - GRUPO XP/ExtratoB3 2020-01-31 Janeiro-2020.xls');;

// get first sheet
let first_sheet_name = workbook.SheetNames[0];
let worksheet = workbook.Sheets[first_sheet_name];

// read value in D4 
// let cell = worksheet['A1'].v;
// console.log(cell)

// modify value in D4
// worksheet['A1'].v = 'NEW VALUE from NODE';

// modify value if D4 is undefined / does not exists
XLSX.utils.sheet_add_aoa(worksheet, [['NEW VALUE from NODE']], {origin: 'A1'});

// write to new file
// formatting from OLD file will be lost!
XLSX.writeFile(workbook, 'test2.xls');