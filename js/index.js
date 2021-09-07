console.log("ploup");
var doc = document;


var players = [
    {
        id: 1,
        class: "player_1",
        value: "O"
    },
    {
        id: 2,
        class: "player_2",
        value: "X"
    }
]

class PlayerHandler {
    turnIndex = 0;
    active = players[this.turnIndex];
    switch = () => {
        this.turnIndex === 0 ? this.turnIndex = 1 : this.turnIndex = 0;
        this.active = players[this.turnIndex];
    }
}
myPH = new PlayerHandler();


const turnEvent = new Event("switchTurn");

var DOMGame = document.getElementById("game");
DOMGame.addEventListener("switchTurn", () => {
    myPH.switch();
    let DOMplayer = document.getElementById("player");
    DOMplayer.childNodes[0].nodeValue = `Joueur ${myPH.active.id}`;
});

class Board {
    cells = [];
    width;
    id;
    victoryCases() {//Ajouter un contrôle
        return [
            this.cells[0].playerId === this.cells[1].playerId && this.cells[0].playerId === this.cells[2].playerId && this.cells[2].playerId !== undefined,
            this.cells[3].playerId === this.cells[4].playerId && this.cells[3].playerId === this.cells[5].playerId && this.cells[5].playerId !== undefined,
            this.cells[6].playerId === this.cells[7].playerId && this.cells[6].playerId === this.cells[8].playerId && this.cells[8].playerId !== undefined,
            this.cells[0].playerId === this.cells[3].playerId && this.cells[0].playerId === this.cells[6].playerId && this.cells[6].playerId !== undefined,
            this.cells[1].playerId === this.cells[4].playerId && this.cells[1].playerId === this.cells[7].playerId && this.cells[7].playerId !== undefined,
            this.cells[2].playerId === this.cells[5].playerId && this.cells[2].playerId === this.cells[8].playerId && this.cells[8].playerId !== undefined,
            this.cells[0].playerId === this.cells[4].playerId && this.cells[0].playerId === this.cells[8].playerId && this.cells[8].playerId !== undefined,
            this.cells[6].playerId === this.cells[4].playerId && this.cells[6].playerId === this.cells[2].playerId && this.cells[2].playerId !== undefined
        ];
    }
    constructor(num, idStr) {
        this.width = num;
        this.id = idStr;
    }
    draw() {
        var DOMBoard = document.getElementById(this.id);
        // DOMBoard.addEventListener("switchTurn", () => {
        //     console.log("ok event");
        // });
        for (var i = 0; i < this.width ** 2; i++) {
            const myCell = new Cell(i, "game");
            this.cells.push(myCell);
            console.log(myCell.value);
            let butt = myCell.draw();
            DOMBoard.appendChild(butt);
        };
    }
    setVictory() {
        document.getElementById("player")
            .childNodes[0].nodeValue = `Le joueur ${myPH.active.id} a gagné.`
    }
}
class Cell {
    id;
    value;
    target;
    playerId;
    DOMCell;
    play = () => {
        console.log(this.target.events);
        this.playerId = myPH.active.id;
        this.DOMCell.childNodes[0].nodeValue = myPH.active.value;
        victoryControl(this.playerId, myBoard);
        this.target.dispatchEvent(turnEvent);


    }
    constructor(val, str) {
        this.id = val;
        this.target = document.getElementById(str);
    }
    draw() {
        let butt = document.createElement("button");
        butt.className = "board__cell";
        butt.id = `cell_${this.id}`;
        butt.onclick = this.play;
        butt.appendChild(document.createTextNode(""));
        // butt.appendChild(document.createTextNode(this.id));
        this.DOMCell = butt;
        return butt;
    }
}

var myBoard = new Board(3, "board");
// alert(myBoard.id);
myBoard.draw();

function test() {
    alert("OK");
};
console.log();

function victoryControl(id, board) {
    console.log('victoryControl running');
    let cells = board.cells;
    let cases = board.victoryCases();
    // console.log(`Joueur ${id} vient de jouer. Joueur ${myPH.active.id} est actif.`);
    cases.forEach(el => {
        try {
            if (el) {
                board.setVictory();
                throw id;
            };
        } catch (e) { console.log(`Victoire pour Joueur ${e}`) };
    }

    );
}
