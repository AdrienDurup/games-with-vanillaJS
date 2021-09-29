const cons = require("consolidate");
const fs = require("fs");
module.exports = {
  render: (path, valsObj) => {
    try {
      let htmlStr = fs.readFileSync(path, "utf-8");
      let keys = [];

      // const regex = /(?<=\$\{)[a-zA-Z_][a-zA-Z_0-9\.\[\]^-]*(?=\})/g;
      const regex = /(?<=\$\{).*?(?=\})/g;
      const regexVar = /^[a-zA-Z_][a-zA-Z_0-9^-]*$/;
      const regexProp = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)+$/;
      const regexArray = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)*\[.*\]$/;//non utilisé encore
      const varArray = htmlStr.match(regex);
      // console.log("VIEWR varArray : "+varArray,regexVar.test(varArray[0]),regexProp.test(varArray[1]));
      for (el of varArray) {
        findReplace(el);
      };

      function findReplace(varName) {
        if (regexVar.test(varName)) {
          // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
          htmlStr = htmlStr.replace("${" + varName + "}", valsObj[varName]);
        } else if (regexProp.test(varName)) {
          //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
          const nameArr = varName.split(".");
          let tmpValObj =valsObj;

          /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
           tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
           … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
           à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/

          for (let i = 0; i < nameArr.length; i++) {
            tmpValObj = tmpValObj[nameArr[i]];
          };

          htmlStr = htmlStr.replace("${" + varName + "}", tmpValObj);
        }else if(regexArray.test(varName)){

        }else{
          throw ` : "${varName}" is not a valid variable name shape.`;
        };
      }

      return htmlStr;

    } catch (e) {
      console.error(e);
    };
  },
  init: (xprLocals) => {//express locals
    this.locals = xprLocals;
    console.log(this.locals);
  }
}

/* AUTRE point de vue, à refaire : 
on parse l’objet en paramètre pour récup les clés et les sous clés */