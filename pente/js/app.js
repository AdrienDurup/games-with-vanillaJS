const app = {
    def: {
        author: "Gary Gabrel",
        size: 19,
    },
    gameState: {
        playerList: [],
        activePlayer: {},
    },
    Player: class {
        static list = [];
        id = "";
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
                let score=this.checkAxis(axes[i]);
                console.log(`score sur l’axe ${axes[i]} : ${this.score}`);
                if(score===5){
                    app.gameOver();
                    break;
                                };
            };

        }
        checkAxis(axis) {//tuple from axes array
            let score=1;
            score+=this.checkOneDirection(axis);
            /* reverse */
            score+=this.checkOneDirection([axis[0] * -1, axis[1] * -1]);
            return score;
        }
        checkOneDirection(axis) {
            let score=0;
            for (let i = 1; i < 5; i++) {
                // console.log(this.move, axis);
                // console.log(this.move[0] + axis[0] * i);
                // console.log(`cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`);
                if (app.Cell.dictionary[`cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`].value === this.id) {
                    score++;
                } else {
                    break;
                };
            };
            return score;
        }


    },
    gameOver:()=>{
console.log(`${app.gameState.activePlayer.id} a gagné !`);
    },
    Cell: class {
        static dictionary={};
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
            app.Cell.dictionary[this.id]=this;
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
            this.DOM.addEventListener("click", (e) => {
                console.log(`Cell id is ${this.DOM.id}`);

                if (this.value === "") {
                    console.log(`clic by ${app.gameState.activePlayer.id}`);
                    this.value = app.gameState.activePlayer.id;
                    app.gameState.activePlayer.move = this.coordinate;
                    this.stoneContainer.className = `stone stone--j${app.gameState.activePlayer.index}`;
                    console.log(this.stoneContainer.classList);
                    app.gameState.activePlayer.checkVictory();
                    app.nextPlayer();
                };

            });

        }


    },
    nextPlayer: () => {
        if (app.gameState.activePlayer.index === app.Player.list.length - 1) {
            app.gameState.activePlayer = app.Player.list[0];
        } else {
            app.gameState.activePlayer = app.Player.list[app.gameState.activePlayer.index + 1];
        };
        console.log(`${app.gameState.activePlayer.id}’s turn`);
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
        let p1 = new app.Player("Adrien", "red");
        let p2 = new app.Player("Numéro2", "yellow");
        app.gameState.activePlayer = p1;
    }
}
document.addEventListener("DOMContentLoaded", app.init);