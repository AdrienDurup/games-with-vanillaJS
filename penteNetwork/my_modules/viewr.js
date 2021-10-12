const cons = require("consolidate");
const fs = require("fs");
const viewr = {
  ext: ".viewr",
  render: (path, valsObj) => {
    try {
      let htmlStr = fs.readFileSync(path, "utf-8");
      let keys = [];

      // const regex = /(?<=\$\{)[a-zA-Z_][a-zA-Z_0-9\.\[\]^-]*(?=\})/g;
      const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;
      const regexVar = /^[a-zA-Z_][a-zA-Z_0-9^-]*$/;
      const regexProp = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)+$/;
      const regexArray = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)*\[.*\]$/;//non utilisé encore
      /* crée une string regex pour toutes les reconnaissances de ${fonctionDuModuleViewr()} */
      function functionWrap(funcName) {
        // return `(?<=\\$\\{\\s*${funcName}\\(\\s*)(.*)(?=\\s*\\)\\s*\\})`;
        return `(\\$\\{\\s*${funcName}\\(\\s*)(.*)(\\s*\\)\\s*\\})`;
      }
      const outerRx = new RegExp(functionWrap("outerComponent"));
      const innerCompRxGlobal = new RegExp(functionWrap("component"),"g");
      const innerCompRx = new RegExp(functionWrap("component"));
      // const outerRx = /(?<=\$\{\s*outerComponent\(\s*["'`]).*(?=["'`]\s*\)\s*\})/;
      console.log(outerRx);

      /* On fournit les composants englobants */
      const outer = htmlStr.match(outerRx);
      if (outer) {
        outerComponent(outer);
      };

      /* On fournit les composants intérieurs */
      const innerComps = htmlStr.match(innerCompRxGlobal);
      if(innerComps){
        for (el of innerComps) {
          component(el);
        };
      };

      /* On fournit les variables */
      const varArray = htmlStr.match(regex);
      if(varArray){
        for (el of varArray) {
          findReplace(el);
        };
      };


    /* 
    TODO RECURSIVITÉ : pour aller chercher les composants extérieurs tant qu’il en trouve à chaque injection
     */
      function outerComponent(outerMatch) {//n’accepte qu’une seule occurence par fichier
        const path=outerMatch[2];
        const viewrFuncLine=outerMatch[0];
        let outerStr = fs.readFileSync(path.split("\"").join("") + viewr.ext, "utf-8");
        htmlStr=htmlStr.replace(viewrFuncLine,"");//replace vs split join ?
        htmlStr = outerStr.replace("<<INSERTION-POINT>>", htmlStr);
        console.log(htmlStr);
      }

      function component(innerCompsMatch) {//Attention match global en amont donc sans les capturants
        const match=innerCompsMatch.match(innerCompRx);
        const path=match[2];
        const viewrFuncLine=match[0];
        let componentStr = fs.readFileSync(path.split("\"").join("") + viewr.ext, "utf-8");
        htmlStr=htmlStr.replace(viewrFuncLine,componentStr);//replace vs split join ?
        console.log(htmlStr);
      }

      function findReplace(varName) {
        if (regexVar.test(varName)) {
          // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
          htmlStr = htmlStr.replace("${" + varName + "}", valsObj[varName]);
        } else if (regexProp.test(varName)) {
          //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
          const nameArr = varName.split(".");
          let tmpValObj = valsObj;

          /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
           tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
           … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
           à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/

          for (let i = 0; i < nameArr.length; i++) {
            tmpValObj = tmpValObj[nameArr[i]];
          };

          htmlStr = htmlStr.replace("${" + varName + "}", tmpValObj);
        } else if (regexArray.test(varName)) {

        } else {
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
};
module.exports = viewr;

/* AUTRE point de vue, à refaire :
on parse l’objet en paramètre pour récup les clés et les sous clés */