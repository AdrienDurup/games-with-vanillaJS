console.log("ploup");
var boardSize=3;
var cells=[];
// var cel= function (value){
//     return {
// value:value,
// target:"board"
//     }
// }
// var test=document.getElementsByClassName("game-main");
// console.log(test.className);
class Cell{
value;
target;
playS;
play=()=>{
    alert(this.value);
}
constructor(value){
    this.value=value;
    this.target="board";
}
    }

   function test(){
       alert("OK");
   };
      console.log();
function drawBoard(){
    var myBoard=document.getElementById("board");
    console.log(typeof myBoard);
    console.log(myBoard.className);
    console.log(boardSize**2);
  for(var i=0;i<boardSize**2;i++){
      const myCell=new Cell(i);
      cells.push(myCell);
      console.log(myCell.value);
      let butt=document.createElement("button");
butt.className="board__cell";
butt.id=`cell_${myCell.value}`;
butt.onclick=cells[myCell.value].play;
butt.appendChild(document.createTextNode(myCell.value));
myBoard.appendChild(butt);
}  ;
}
drawBoard();