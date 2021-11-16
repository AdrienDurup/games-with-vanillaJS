const fs = require("fs");
const axios = require("axios");
const ext = ".viewr";
const vrHlp = require("./lib/helpers");

class ViewR {
  /* 
  TODO PUT ALL REGEX IN VIEWR PROPERTY viewr.rx
  */
  static components = [];
  set components(v) {
    if (v.constructor.name === "VRComponent") {
      components.push(v);
    };
  };
  static rx = {
    stringAndVarParamRx: /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/,
    stringVarVarParamRx: /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/,
  };
  set rx(v) { };
  locals = {};
  componentRenderReady = new EventEmitter();

  constructor() {//express locals

  }

  static middleware = (req, res, next) => {
    /* En attente */
  }

  static renderSync(pathString, valsObj) {
    try {
      // console.log("render running");
      const path = pathString.split("\"").join("") + ext;
      let htmlStr = fs.readFileSync(path, "utf-8");

      const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;
      /* crée une string regex pour toutes les reconnaissances de ${fonctionDuModuleViewr()} */
      const outerRx = new RegExp(vrHlp.functionWrap("wrapperSnippet"));
      const innerCompRx = new RegExp(vrHlp.functionWrap("snippet"), "g");
      const loopCompRx = new RegExp(vrHlp.functionWrap("loopSnippet"), "g");
      const toggleCompRx = new RegExp(vrHlp.functionWrap("togglable"), "g");

      /* On fournit les snippets englobants */
      const outer = htmlStr.match(outerRx);
      if (outer) {
        htmlStr = ViewR.wrapperSnippet(outer, htmlStr);
      };

      /* On fournit les snippets intérieurs */
      /* les simples */
      const innerComps = htmlStr.match(innerCompRx);
      if (innerComps) {
        for (const el of innerComps) {
          const generatedHTML = ViewR.snippet(valsObj, htmlStr, el);
          if (generatedHTML !== "")
            htmlStr = generatedHTML;
        };
      };
      // console.log(htmlStr);

      /* On fournit les boucles */
      const loopComps = htmlStr.match(loopCompRx);
      if (loopComps) {
        for (const el of loopComps) {
          htmlStr = ViewR.loopSnippet(valsObj, htmlStr, el);
        };
      };

      /* On fournit les toggles */
      const toggleComps = htmlStr.match(toggleCompRx);
      // console.log(toggleCompRx,toggleComps);
      if (toggleComps) {
        // console.log("hasToggle", toggleComps);
        for (const el of toggleComps) {
          htmlStr = ViewR.togglable(valsObj, htmlStr, el);
        };
      };


      /* On fournit les variables */
      /* 
      TODO ajouter un meilleur controle sur la regex
      qui prend les loops pour des variables 
       */
      const varArray = htmlStr.match(regex);
      if (varArray) {
        for (const el of varArray) {
          const tmpStr = ViewR.findReplace(valsObj, htmlStr, el);
          if (tmpStr)
            htmlStr = tmpStr;
        };
        // console.log("varArray",htmlStr);
      };

      /* 
      TODO RECURSIVITÉ : pour aller chercher les composants extérieurs tant qu’il en trouve à chaque injection
       */
      //console.log("FINAL",htmlStr);
      return htmlStr;

    } catch (e) {
      console.error(e);
    };
  }

  static async render(pathString, valsObj) {
    try {
      /* rendu des snippets */
      let htmlStr = ViewR.renderSync(pathString, valsObj);

      /* rendu des composants */
      const compRx = new RegExp(vrHlp.functionWrap("component"), "g");
      const comps = htmlStr.match(compRx);
      if (comps) {
        console.log("comps", comps);
        for (const el of comps) {
          htmlStr = await ViewR.component(valsObj, htmlStr, el);
        };
      };
      return htmlStr;
    } catch (e) {
      console.error(e);
    };
  }

  static async component(valsObj, htmlStr, compsMatchElement) {
    try {
      const stringOptionalVarParamRx = /["'`](.*)["'`]\s*(,\s*([a-zA-Z_][a-zA-Z_0-9^-]*))?/;

      const match = compsMatchElement.match(stringOptionalVarParamRx);
      console.log(match);
      const viewrFuncLine = compsMatchElement;
      if (match) {
        const pathArray = match[1].split(/["'`]/).join("").split("\/");
        const compName = pathArray[pathArray.length - 1];
        const path = match[1];
        let values;
        if (match[3]) {
          values = valsObj[match[3]];
        };
        const MyComp = require(fs.realpathSync(`${path}/${compName}.js`));
        // console.log("instanciation of " + `${path}/${compName}.js`);
        // let componentStr = "<div>ViewR ERROR : couldn’t fetch required data.</div>";
        const myComp = new MyComp();
        const componentStr = await myComp.render();
        htmlStr= htmlStr.replace(viewrFuncLine, componentStr);
        // console.log("FINAL ASYNC RENDER",str);
        return htmlStr;
        // myComp.render();

      };
    } catch (e) {
      console.error(e);
      return htmlStr;
    }; r
  }

  static wrapperSnippet(outerMatch, htmlStr) {//n’accepte qu’une seule occurence par fichier
    const path = outerMatch[1];
    const viewrFuncLine = outerMatch[0];
    let outerStr = fs.readFileSync(path.split("\"").join("") + ext, "utf-8");
    htmlStr = htmlStr.replace(viewrFuncLine, "");//replace vs split join ?
    htmlStr = outerStr.replace("<<INSERTION-POINT>>", htmlStr);
    return htmlStr;
    // console.log(htmlStr);
  }
  /* /!\ Fonction test qui ne gère pas l’absence de valeur */
  /*  @param valObj:globl values Object passed at render in the first place
  @param str: string to modify
  @ innerCompsMatchElement: element from array of viewr-components declarations, matching the component() pattern
   */
  static snippet(valsObj, str, innerCompsMatchElement) {//Attention match global en amont donc sans les capturants
    console.log("snippet() running");
    const stringAndVarParamRx = /["'`](.*)["'`]\s*,\s*([a-zA-Z_][a-zA-Z_0-9^-]*)/;
    if (!innerCompsMatchElement) {
      return null;
    };
    const match = innerCompsMatchElement.match(stringAndVarParamRx);
    let path, values, objectName, viewrFuncLine;
    if (match) {
      path = match[1].split(/["'`]/).join("");
      objectName = match[2];
      values = valsObj[objectName];
      viewrFuncLine = innerCompsMatchElement;
      let componentStr = ViewR.renderSync(path, values);
      //console.log(componentStr);
      return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
      // console.log(str);
    };
  }

  static loopSnippet(valsObj, str, loopCompMatchElement) {//valsObj l’objet "global" à render qui contient toute la data nécessaire
    // console.log(valsObj);
    try {

      if (!loopCompMatchElement)
        return null;
      const match = loopCompMatchElement.match(ViewR.rx.stringAndVarParamRx);
      console.log("loop running");
      let path, values, objectName, viewrFuncLine;
      if (match) {
        path = match[1].split(/["'`]/).join("");
        objectName = match[2];
        values = valsObj[objectName];
        viewrFuncLine = loopCompMatchElement;
        // console.log(viewrFuncLine);
      } else {
        throw `ViewR Error : invalid argument string in ${loopCompMatchElement}`;
      }
      const tmpArray = [];
      for (const dataObject of values) {
        tmpArray.push(ViewR.renderSync(path, dataObject));
      };
      return str.replace(viewrFuncLine, tmpArray.join("\n"));
    } catch (e) {
      console.error(e);
    };

  }

  /* 
  fusionner togglable avec component ?
  TODO gestion des erreurs */
  static togglable(valsObj, str, toggleMatchElement) {
    console.log("togglable() running");
    try {
      //     if (!toggleMatchElement)
      // return null;
      const match = toggleMatchElement.match(ViewR.rx.stringVarVarParamRx);
      const viewrFuncLine = toggleMatchElement;
      let path, values, conditionValue;
      if (match) {
        conditionValue = valsObj[match[3]];// match[3] donne un nom de variable 
        console.log(conditionValue);
        if (conditionValue) {
          path = match[1].split(/["'`]/).join("");
          values = valsObj[match[2]];// match[2] donne un nom de variable 
          let componentStr = ViewR.renderSync(path, values);
          return str.replace(viewrFuncLine, componentStr);//replace vs split join ?
        } else {
          return str.replace(viewrFuncLine, "");
        };
      } else {
        throw `ViewR Error : invalid argument string in ${toggleMatchElement}`;
      };
    } catch (e) {
      console.error(e);
    };
  }

  static findReplace(valsObj, str, varName) {
    try {
      // console.log("str in findreplace", str);
      const regexVar = /^[a-zA-Z_][a-zA-Z_0-9^-]*$/;
      const regexProp = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)+$/;
      const regexArray = /^[a-zA-Z_][a-zA-Z_0-9^-]*(\.[a-zA-Z_0-9^-]*)*\[.*\]$/;//non utilisé encore
      if (regexVar.test(varName)) {
        // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
        return str.replace("${" + varName + "}", valsObj[varName]);
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

        return str.replace("${" + varName + "}", tmpValObj);
      } else if (regexArray.test(varName)) {
        console.log("Array not implemented Yet");
        /*
            TODO  Implement Array row recognition 
        */
      };
    } catch (e) {
      console.log(e);
    };
  }


  /* 
  ============================================
  STATIC FUNCTIONS FOR COMPONENT INTERACTION
  ============================================
  */


  static replaceVar(valsObj, str) {

    try {
      /* On fournit les variables */
      /* 
      TODO ajouter un meilleur controle sur la regex
      qui prend les loops pour des variables 
       */ const regex = /(?<=\$\{\s*).*?(?=\s*\})/g;

      const varArray = str.match(regex);
      if (varArray) {
        for (const el of varArray) {
          str = findReplace(valsObj, str, el);
        };
        return str;
      };

      function findReplace(valsObj, str, varName) {
        // console.log("str in findreplace", str);
        const regexVar = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
        const regexProp = /^[a-zA-Z_][a-zA-Z_0-9]*(\.[a-zA-Z_0-9]*)+$/;
        const regexArray = /^[a-zA-Z_][a-zA-Z_0-9]*(\.[a-zA-Z_0-9]*)*\[.*\]$/;//non utilisé encore
        if (regexVar.test(varName)) {
          // console.log(`VIEWR regexVar "${varName}" : `+regexVar.test(varName));
          return str.replace("${" + varName + "}", valsObj[varName]);
        } else if (regexProp.test(varName)) {
          //  console.log(`VIEWR regexProp "${varName}": `+regexProp.test(varName));
          const nameArr = varName.split(".");
          console.log("nameArr ==>", nameArr);
          let tmpValObj = {};
          Object.assign(tmpValObj, valsObj);
          console.log("ASSIGN", tmpValObj);
          /* pour chaque partie du tableau nameArr, on va chercher plus loin à l’intérieur de
           tmpValObj copie de (tmpValObj) : tmpValObj[nameArr[0]][nameArr[1]][nameArr[2]]...
           … équivalent à tmpValObj["prop1"]["prop2"]["prop3"]
           à chaque boucle on change l’objet en référence jusqu’à ce qu’on récupère une valeur primitive à la fin*/
          for (let i = 0; i < nameArr.length; i++) {
            tmpValObj = tmpValObj[nameArr[i]];
            /* 
            TODO Contrôler et gérer les inadéquations entre la data reçue et celle attendue */

            // console.log("KEYS", Object.keys(tmpValObj), typeof tmpValObj, tmpValObj);
          };
          // console.log("STR",str);
          const regexToReplace = new RegExp("\\$\\{\\s*" + varName + "\\s*\\}");
          return str.replace(regexToReplace, tmpValObj);

        } else if (regexArray.test(varName)) {
          console.log("Array not implemented Yet");
          /*
              TODO  Implement Array row recognition 
          */
        };
      };
    } catch (e) {
      console.log(e);
    };
  }
}

const https = require("https");
const http = require("http");
const { EventEmitter } = require("stream");

/* 
============================================
CLASS FOR COMPONENTS
============================================
*/
/* 
TODO METTRE EN PLACE DU READ ONLY */
class VRComponent {
  queryOptions = {
    url: `http://localhost:1982`,
  };
  id = 0;
  dirname;
  path;
  viewr;
  constructedView = "";
  dataReceiver = { data: undefined };
  transformation = () => { };
  constructor(queryOptions, realPath) {
    this.queryOptions = queryOptions;
    this.id = ViewR.components.length;
    this.path = realPath;
    this.viewr = this.setViewr();
    this.dirname=this.#setDirname();
    /* on met data à undefined pour le cas où l’utilisateur 
    souhaite réécrire constructWith mais pas transformation */
    //can be filled with function with string parameter and optional data
    this.transformation = (viewr, data = undefined) => {
      console.log("let’s transform");
      return viewr;
    };
  }
  /* on va chercher la data sur le server */
  async queryData(receiver = this.dataReceiver) {
    try {
      const queryResult = await axios.get(this.queryOptions.url);
      receiver.data = queryResult.data;
      // console.log("received ?",receiver.data);
      this.constructedView = this.constructWith(receiver.data);
      console.log("this.constructedView before render", this.constructedView);
    } catch (e) {
      console.error(e);
    };
  }

  constructWith = (data) => {
    let constructStr = this.viewr;
    // console.log(this);
    // if (transformation)
    constructStr = this.transformation(constructStr, data);
    // console.log(constructStr,data);
    // console.log("before replaceVar is data OK ?",this.dataReceiver.data);
    const replacementResult = ViewR.replaceVar({ data: this.dataReceiver.data }, constructStr);
    // console.log("test de replace",replacementResult);
    return replacementResult;
  }

  /* permet de stocker la string du balisage .viewr dans l’instance*/
  setViewr() {
    // let name = this.constructor.name;
    // const firstLetterLower = name.slice(0, 1).toLowerCase();
    // name = name.replace(/./, firstLetterLower);
    const name=this.#setDirname();
    return fs.readFileSync(`${this.path}/${name}.viewr`, "utf-8");
  }
  #setDirname=()=>{
    let name = this.constructor.name;
    const firstLetterLower = name.slice(0, 1).toLowerCase();
    name = name.replace(/./, firstLetterLower);
    return name;
  };

  /* Méthode appelée par le render de ViewR */
  async render() {
    console.log(`${this.constructor.name}.render() running`);
    await this.queryData();
    console.log("constructedView", this.constructedView);
    return this.constructedView;

  }

}

module.exports = {
  ViewR, VRComponent, fs, http
}




