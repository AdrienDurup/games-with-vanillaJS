const socket = io();
socket.on("initRes",(e)=>{
    try{
        console.log(e);
        console.log(socket);
        const p1= new app.Player(socket.id, "red");
        new app.Player("Numéro2", "yellow");
        /* we set the starting player - for the moment, owner of session */
        app.gameState.activePlayer = p1;
        console.log(`${app.gameState.activePlayer.id}`);
    }catch(e){
        console.error(e);
    }

})
socket.on("moveresponse", (e) => {
    app.gameState = JSON.parse(e).gameState;
    console.log(`STOUT`,app.gameState);
    const lastMoveCell=app.Cell.dictionary[app.gameState.lastMove];
    console.log(`${app.gameState.activePlayer.id}`);
    lastMoveCell.update();
    app.gameState.activePlayer.checkVictory();
app.changePlayer();
    console.log("move response",app.gameState);
});

const app = {
    socket:socket,
    def: {
        author: "Gary Gabrel",
        size: 19,
    },
    gameState: {
        session: "",//récuperer la valeur via l’ID de Body ?
        playerList: [],
        activePlayer: {},
        lastMove: "",
    },
    Player: class {
        static list = [];
        id = "";
        socketId="";
        index = -1;//sa place dans Player.list
        pairs = 0;
        move = [];//tuple
        /*         score=0; */
        color = "";
        constructor(id, color) {
            this.id = id;
            this.color = color;
            this.index = app.Player.list.length;//attention à l’ordre des lignes.
            app.Player.list.push(this);

        };
        checkVictory() {
            console.log("not implemented yet.");
            const axes = [
                [1, 0], [0, 1], [1, 1], [-1, 1]
            ];

            for (let i = 0; i < axes.length; i++) {
                /* vérifie si on a aligné 5 pierres */
                let score = this.checkAxis(axes[i]);
                console.log(`score sur l’axe ${axes[i]} : ${score}`);
                /* Verifie si on vient de capturer des paires */
                this.checkPair(axes[i]);
                this.checkPair([axes[i][0] * -1, axes[i][1] * -1]);
                if (score >= 5 || this.pairs === 5) {
                    app.gameOver();
                    break;
                };
            };

        }
        checkAxis(axis) {//tuple from axes array
            let score = 1;
            /* compte les pierres dans un sens */
            score += this.checkOneDirection(axis);
            /* reverse : compte les pierres en sens inverse*/
            score += this.checkOneDirection([axis[0] * -1, axis[1] * -1]);
            return score;
        }
        /* compte le nombre de pierres dans une direction en partant de la pierre jouée. */
        checkOneDirection(axis) {
            let score = 0;
            for (let i = 1; i < 5; i++) {
                const id = `cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`;
                if (app.Cell.dictionary[id] !== undefined//Si on est hors champ on doit breaker
                    && app.Cell.dictionary[id].value === this.id) {
                    score++;
                } else {
                    break;
                };
            };
            return score;
        }
        checkPair(axis) {
            let pairCheck = [];
            let isPairCheckValid = true;
            for (let i = 1; i < 4; i++) {
                const id = `cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`;
                let aheadCell = app.Cell.dictionary[id];
                if (aheadCell !== undefined) {
                    pairCheck.push({ id: id, value: aheadCell.value });
                } else {
                    isPairCheckValid = false;
                };

            }
            if (isPairCheckValid === true
                && pairCheck[0].value !== this.id
                && pairCheck[0].value === pairCheck[1].value
                && pairCheck[0].value !== ""
                && pairCheck[2].value === this.id
            ) {
                this.pairs++;
                console.log(this.pairs);
                app.deleteStone(pairCheck[0].id);
                app.deleteStone(pairCheck[1].id);
            };
        }


    },
    deleteStone: (id) => {
        app.Cell.dictionary[id].stoneContainer.classList.add("hidden");
        app.Cell.dictionary[id].value = "";
    },
    gameOver: () => {
        console.log(`${app.gameState.activePlayer.id} a gagné !`);
    },
    Cell: class {
        static dictionary = {};
        id = 0;
        coordinate = [];//tuple
        DOM = {};
        stoneContainer = {};
        value = "";
        constructor(id, coordinate) {
            this.id = id;
            this.coordinate = coordinate;
            this.DOM = document.createElement("div");
            this.DOM.id = id;
            app.Cell.dictionary[this.id] = this;
            // console.log(this.DOM.model.coordinate);
            this.DOM.className = "board__cell";
            const line1 = document.createElement("div");
            line1.className = "cell__line cell__line--h";
            const line2 = document.createElement("div");
            line2.className = "cell__line cell__line--v";
            this.DOM.appendChild(line1);
            this.DOM.appendChild(line2);
            this.stoneContainer = document.createElement("div");
            this.stoneContainer.className = "stone hidden";
            this.DOM.appendChild(this.stoneContainer);
            this.DOM.addEventListener("mouseenter", (e) => {
                // console.log("ok : "+`var(--stonePlayer${app.gameState.activePlayer.index})`);
                e.target.style
                    .setProperty("background-image", `var(--stonePlayer${app.gameState.activePlayer.index})`);
            });
            this.DOM.addEventListener("click", (this.handleCellPlay));
        }
        handleCellPlay = (e) => {
            console.log(`Cell id is ${e.target.id}`);
            console.log("Joueur actif ? ",app.gameState.activePlayer);

            if (this.value === "") {
                console.log(`clic by ${app.gameState.activePlayer.id}`);

                app.gameState.lastMove = this.id;



                /* On déclenche un évènement en lui passant l’état du jeu en donnée embarquée */
                const gameDataPackage = {gameState: app.gameState };
                socket.emit("moverequest", JSON.stringify(gameDataPackage));
            };
        }

        /* Permet d’update la vue de la cellule */
        update = () => {
                this.stoneContainer.className = `stone stone--j${app.gameState.activePlayer.index}`;
                console.log(this.stoneContainer.classList);
            console.log("IMPLEMENTER");
        }

    },

changePlayer:()=>{
    if (app.gameState.activePlayer.index === app.gameState.playerList.length - 1) {
        app.gameState.activePlayer = app.gameState.playerList[0];
    } else {
        app.gameState.activePlayer = app.gameState.playerList[app.gameState.activePlayer.index + 1];
    };
},
drawRow: (container, className) => {
    const row = document.createElement("div");
    row.className = className;
    container.appendChild(row);
    return row;
},
    drawBoard: (container) => {
        const board = document.createElement("div");
        board.className = "board";
        for (let i = 0; i < app.def.size; i++) {
            const row = app.drawRow(board, "board__row");
            for (let j = 0; j < app.def.size; j++) {
                const cell = new app.Cell(`cell_${j}_${i}`, [j, i]);
                row.appendChild(cell.DOM);
            }
        };
        container.appendChild(board);
    },
        init: () => {
            app.drawBoard(document.getElementById("gameContainer"));
            app.gameState.playerList=app.Player.list;
            app.gameState.session=document.getElementsByTagName("body")[0].id;
            // console.log(app.gameState);
            
            socket.emit("initSession",JSON.stringify({gameState:app.gameState}));
        }
}
document.addEventListener("DOMContentLoaded", app.init);


                /* Créer ici nue requête html */
                // const req = new XMLHttpRequest();

                /* On lui passe des données */
                // req.submittedData=JSON.stringify({move:this.coordinate});

                /* on récupère le nom de session stocké dans l’id de body  */
                // const session = document.querySelector("body").id;
                /* on poste la requête */
                // const reqJSON = encodeURI(JSON.stringify({ move: this.coordinate }));
                // console.log(`reqJSON : ${reqJSON}`);
                // req.open("GET", `/penteonline/${session}/?json=${reqJSON}`, false);
                // req.send();