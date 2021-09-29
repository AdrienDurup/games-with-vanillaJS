const fs=require("fs");
const conso=require("consolidate");
conso.viewr=(path,valsObj,callback)=>{

  let htmlStr=fs.readFileSync(path,"utf-8");
const keys=Object.keys(valsObj); 
for(el of keys){
console.log(el,valsObj[el]);
console.log("${"+el+"}");
htmlStr=htmlStr.replace("${"+el+"}",valsObj[el]);
};
callback(err,html);
return htmlStr;
}

module.exports=conso.viewr;

// module.exports={
//     render:(path,valsObj,callback)=>{

//         let htmlStr=fs.readFileSync(path,"utf-8");
// const keys=Object.keys(valsObj); 
// for(el of keys){
//   console.log(el,valsObj[el]);
//   console.log("${"+el+"}");
//   htmlStr=htmlStr.replace("${"+el+"}",valsObj[el]);
// };
// callback(err,html);
//   return htmlStr;
// }

// }