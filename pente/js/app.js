const app = {
    def:{
        author:"Gary Gabrel",
size:19,
    },
    Player: class {

    },
    Cell: class {
        id=0;
        coordinate=[];
        constructor(id){
this.id=id;
        }

    },
    drawRow:(container,className)=>{
        const row=document.addEventListener.createElement("div");
        row.className=className;
        container.appendChild(row);
    },
    drawBoard:(container)=>{
        const board=document.addEventListener.createElement("div");
        board.className="board";
        container.appendChild(row);
for (let i=0;i<app.def.size;i++){
const row=app.drawRow(board,"board__row");
for (let i=0;i<app.def.size;i++){
    row.appendChild(new app.Cell());
}
};
    },
    init: () => {
app.drawBoard(document.getElementById("gameContainer"));
    }
}
document.addEventListener("DOMContentLoaded", app.init);