const fs=require("fs");
module.exports={
    render:(path,valsObj)=>{
        let htmlStr=fs.readFileSync(path,"utf-8");
const keys=Object.keys(valsObj); 
for(el of keys){
  console.log(el,valsObj[el]);
  console.log("${"+el+"}");
  htmlStr=htmlStr.replace("${"+el+"}",valsObj[el]);
};
        return htmlStr;
    },
}