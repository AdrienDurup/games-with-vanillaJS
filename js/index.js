console.log("ploup");
var doc = document;


var players = [
    {
        id: 1,
        class: "player_1",
        value: "O",
        moves: "---------",
    },
    {
        id: 2,
        class: "player_2",
        value: "X",
        moves: "---------",
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

/* Fonction pour afficher un message au dessus du board */
function drawComment(str) {
    let DOMplayer = doc.getElementById("player");
    DOMplayer.childNodes[0].nodeValue = str;
}

var DOMGame = doc.getElementById("game");
DOMGame.addEventListener("switchTurn", () => {
    /* on change de joueur actif */
    myPH.switch();
    /* on ajoute les styles relatifs au nouveau joueur actif */
    var root = doc.documentElement;
    root.style.setProperty("--activePlayer", `var(--j${myPH.active.id})`);
    drawComment(`Joueur ${myPH.active.id}`);
});

/* PLATEAU DE JEU */
class Board {
    cells = [];
    width;
    id;
    ph;

    constructor(num, idStr, playerhandler) {
        this.width = num;
        this.id = idStr;
        this.ph = playerhandler;
    }
    draw() {
        var DOMBoard = doc.getElementById(this.id);
        // DOMBoard.addEventListener("switchTurn", () => {
        //     console.log("ok event");
        // });
        for (var i = 0; i < this.width ** 2; i++) {
            const myCell = new Cell(i + 1, "game");//index de 1 à n pour faciliter les substrings dans la methode play()
            this.cells.push(myCell);
            console.log(myCell.value);
            let butt = myCell.draw();
            DOMBoard.appendChild(butt);
        };
    }
    setVictory() {
        drawComment(`Le joueur ${myPH.active.id} a gagné.`);
    }
}

/* CELLULE DE PLATEAU. CREER UN LIEN À PlayerHandler DANS le CONSTRUCEUR */
class Cell {
    id;
    value;
    target;
    playerId;
    DOMCell;
    isPlayed = false;
    play = () => {
        if (!this.isPlayed) {
            
            this.isPlayed = true;
            console.log(this.target.events);
            /* modifier la valeur de myPH.active.moves 
            pour suivre les coups joués pour chaque joueur */
            var writeMoveRX = new RegExp(`(?<=.{${this.id - 1}}).`);
            myPH.active.moves = myPH.active.moves.replace(writeMoveRX, myPH.active.value);
            //   console.log(`moves result : ${myPH.active.moves}`);
            /* fin */
            this.playerId = myPH.active.id;
            this.DOMCell.childNodes[0].nodeValue = myPH.active.value;
            victoryControl(myPH.active, myBoard);
        };
    }
    constructor(val, str) {
        this.id = val;
        this.target = document.getElementById(str);
    }
    draw() {
        let butt = doc.createElement("button");
        butt.className = "board__cell";
        butt.id = `cell_${this.id}`;
        butt.onclick = this.play;
        butt.appendChild(doc.createTextNode(""));
        this.DOMCell = butt;
        return butt;
    }
}

/* TRANSFORMER EN METHODE DE OBJET JOUEUR ? */
function victoryControl(player, board) {
    // console.log('victoryControl running');
    let victoryCasesRX = new RegExp(`((.{3})*${player.value}{3})|(player.value}(.{2}${player.value}){2})|(${player.value}((.{3})${player.value}){2})|(.{2}${player.value}.${player.value}.${player.value})`);
    let res = victoryCasesRX.test(player.moves);
    console.log(` regex : ${victoryCasesRX}`);
    console.log(`test de victoire via regex : ${res}`);
    if (res) {
        board.setVictory();
        console.log("victory");
        return;
    } else {
        // this.target.dispatchEvent(turnEvent);
        doc.getElementById("game").dispatchEvent(turnEvent);
    };
    console.log("no victory");
}

/* Je génère mon board */
var myBoard = new Board(3, "board", myPH);
/* je l’affiche */
myBoard.draw();