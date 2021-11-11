const {ViewR,VRComponent}=require("../../../my_modules/viewr");
const data=require("./data.json");

class StartCard extends VRComponent{
    constructor() {
        /* super constructor needs script path for ViewR to access component files */
        super(StartCard.queryOptions, __dirname);
      }

      async queryData() {
        this.constructedView = await this.constructWith(data);
    }
    constructWith = (data) => {
        let constructStr = this.viewr;
        constructStr = this.transformation(constructStr, data);
        let cards = [];
        for (const el of data) {
            console.log("TEST",`${this.path}/${this.dirname}`, el);
            cards.push(ViewR.renderSync(`${this.path}/${this.dirname}`, el));
        };
        // const replacementResult = ViewR.renderSync(`${this.path}/${this.dirname}`, { data:data[0] });
    
        return cards.join("");
    }
}

module.exports=StartCard;

