const socket = io();
/*
 TODO refactoriser en passant tout le game logic coté server : socket ne servira qu’à déclencher la récupération de data : vue des coups joués,
 TODO et autorisation à jouer pour le joueur actif. le gameState est stocké côté server une fois plutot qu’en double sur chaque client.
  */
socket.on("initRes", (e) => {
    try {
        const res = JSON.parse(e);
        console.log(res);
        const sessionData = res.sessionData;
        const myName = res.myName;
        /* we set the starting player - for the moment, owner of session */
        app.session = sessionData;
        app.gameState = sessionData.logic.state;
        console.log("active", app.gameState.activePlayer.name);
        app.me = sessionData.playerDict[myName];
        /* we fill player boards with name*/
        for (key in app.PlayerBoard.dict) {
            if (key === "owner") {
                console.log(key);
                app.PlayerBoard.dict[key].setPlayerName(sessionData.owner.name);
            } else if (key === "guest" && JSON.stringify(sessionData.guest) !== '{}') {//on check si un guest est créé dans la session
                app.PlayerBoard.dict[key].setPlayerName(sessionData.guest.name);
            };
        };
    } catch (err) {
        console.error(err);
    }

})
socket.on("updatePlayerBoard", (e) => {
    try {
        app.session=JSON.parse(e).sessionData;
        app.PlayerBoard.updateAll(app.session);

    } catch (err) {
        console.error(err);
    }
});

socket.on("moveResponse", (e) => {
    app.gameState = JSON.parse(e).gameState;
    console.log(`STOUT`, app.gameState);
    const lastMoveCell = app.Cell.dictionary[app.gameState.lastMoveId];
    console.log(`current player is ${app.gameState.activePlayer.ip, app.gameState.activePlayer.name}`);
    /* on met à jour la vue de la dernière cellule jouée */
    lastMoveCell.update();
    /* on supprime des paires sur le tablier */
    if (app.gameState.toDelete.length > 0) {
        for (el of app.gameState.toDelete) {
            app.deleteStone(el);
        };
    };
    /* On met à jour la vue des player boards */
    app.PlayerBoard.updateAll(app.gameState);
    /* on change de joueur actif. déclenché une fois du coté du joueur actif */
    if (app.gameState.activePlayer.name === app.me.name) {
        socket.emit("changePlayer", JSON.stringify({ sessionName: app.gameState.sessionName }));
    };
});

socket.on("changePlayerResponse", (e) => {
    app.gameState = JSON.parse(e).gameState;
});

const app = {
    // socket: socket,
    session: {},
    me: { index: "2" },//replaced by player object
    def: {
        author: "Gary Gabrel",
        size: 19,
    },

    gameState: {//se récupère régulièrement depuis le serveur
        sessionName: "",//récuperer la valeur via l’ID de Body ?
        playerList: [],
        playerDictionary: {},
        activePlayer: {},
        lastMoveId: "",
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
            /* 
            TODO remplacer par une solution sans event listener et coté server
            */
            this.DOM.addEventListener("mouseenter", (e) => {
                e.target.style
                    .setProperty("background-image", `var(--stonePlayer${app.me.index})`);
            });
            this.DOM.addEventListener("click", (this.handleCellPlay));
        }
        handleCellPlay = (e) => {
            /* 
            TODO faire des requetes au server et virer la logique totalement d’ici */
            console.log(`Cell id is ${e.target.id}`);
            console.log("Joueur actif ? ", app.gameState.activePlayer);
            console.log("my turn ?", app.gameState.activePlayer.ip + app.gameState.activePlayer.name, app.me.ip + app.me.name);
            /* controlons si la personne qui clique a le droit de jouer */
            if (app.gameState.activePlayer.ip + app.gameState.activePlayer.name !== app.me.ip + app.me.name) {
                return;
            };
            /* si la cellule est vide, le coup est validé */
            console.log("this", this, typeof this.value);
            console.log(this.value === "");
            if (this.value === "") {
                console.log(`clic by ${app.gameState.activePlayer.name} : this.value = ${this.value}`);
                app.gameState.lastMoveId = this.id;
                app.gameState.activePlayer.move = this.coordinate;
                console.log("handleCellPlay : last move :", app.gameState.lastMoveId);
                /* On déclenche un évènement en lui passant l’état du jeu en donnée embarquée */
                socket.emit("moverequest", JSON.stringify({ gameState: app.gameState }));
            };
        }

        /* Permet d’update la vue de la cellule */
        update = () => {
            this.value = app.gameState.activePlayer.name;
            this.stoneContainer.className = `stone stone--j${app.gameState.activePlayer.index}`;
            console.log(this.stoneContainer.classList);
        }

    },
    PlayerBoard: class {
        static dict = {};
        id;
        playerName;
        role;
        constructor(container, userRole, isAfter = true) {
            this.role = userRole;
            this.playerName = userRole;//temporary
            /* DOM definition */
            this.DOM = app.drawPlayerBoard(container, userRole, isAfter);
            this.id = this.DOM.id;
            app.PlayerBoard.dict[userRole] = this;
            //console.log("PlayBoard dict push",app.PlayerBoard.dict);
        }
        setPlayerName(playerName) {
            if (this.playerName !== playerName) {
                this.playerName = playerName;//dans le model
                this.DOM.childNodes[0].textContent = playerName;//dans la vue. childNodes[0] designe le conteneur du nom.
            };
        }
        drawPairsView(player) {
            const pairs = player.pairs;
            if (pairs > 0) {
             console.log("NODES",this.DOM);
                let pairsContainer = this.DOM.childNodes[1];//la partie du player board qui contient les paires
                const nbToAdd = pairs-pairsContainer.childNodes.length ;//pairsContainer.childNodes.length pour compter
                console.log(pairsContainer,nbToAdd);
                if (nbToAdd > 0) {
                    /* on définit la vue d’une paire */
                    function pairDOM(){
                        const pairDOM = document.createElement("div");
                        pairDOM.className = "stone_pair_container";
                        const pbStone = document.createElement("div");
                        pbStone.className = `player_board__stone stone--position1
                        stone--j${player.index}`;
                        const pbStone2 = document.createElement("div");
                        pbStone2.className = `player_board__stone stone--position2
                         stone--j${player.index}`;
                        pairDOM.appendChild(pbStone);
                        pairDOM.appendChild(pbStone2);
                        return pairDOM;
                    }

                    /* on rajoute dans l’affichage le nombre paires manquantes */
                    for (let i = 0; i < nbToAdd; i++) {
                        console.log(i);
                        pairsContainer.appendChild(pairDOM());
                    };
                };
            };
        }
        updatePairs() {
            const pname = this.playerName;
            const player = state.playerDictionary[pname];
            /* mise à jour des paires */
            this.drawPairsView(player);
        }
        static updateAll(session) {
            let index = 0;
            console.log("updating");
            for (const el in this.dict) {
                const player = session.playerList[index];
                console.log(`Player is ${player}`);
                if(player){
                /* mise à jour du nom */
                this.dict[el].setPlayerName(player.name);
                /* mise à jour des paires */
                this.dict[el].drawPairsView(player);
                index++;
            };
            };
        }
    },
    /* Pour supprimer une paire de pierres de la vue */
    deleteStone: (coordinate) => {
        const id = `cell_${coordinate[0]}_${coordinate[1]}`;
        app.Cell.dictionary[id].stoneContainer.classList.add("hidden");
        app.Cell.dictionary[id].value = "";
    },
    /* Pour créer une rangée dans la vue */
    drawRow: (container, className) => {
        const row = document.createElement("div");
        row.className = className;
        container.appendChild(row);
        return row;
    },
    drawPlayerBoard: (container, playerRole, isAfter) => {
        const pboard = document.createElement("div");
        pboard.id = playerRole;
        pboard.className = "player_board";
        const nameDisplay = document.createElement("span");
        nameDisplay.className="player_board__name";
        nameDisplay.textContent = playerRole;
        const pairsDisplay = document.createElement("span");
        pairsDisplay.className="pairs_container";
        pboard.appendChild(nameDisplay);
        pboard.appendChild(pairsDisplay);
        //console.log(pairsDisplay,pboard);
        console.log(pboard);
        console.log("isAfter", isAfter);
        if (isAfter)
            container.appendChild(pboard);
        else {
            container.prepend(pboard);
        }
        return pboard;
    },
    /* Pour créer le plateau dans la vue */
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
    /* Pour créer la table dans la vue, qui contient des informations et le plateau */
    drawTable: (container) => {
        const table = document.createElement("div");
        table.id = "gameTable";
        table.className = "game_table";
        new app.PlayerBoard(table, "owner");
        new app.PlayerBoard(table, "guest");
        app.drawBoard(table);
        container.appendChild(table);
    },
    /* pour initialiser la partie */
    init: () => {
        app.drawTable(document.getElementById("gameContainer"));
        const sessionInfo = document.getElementsByClassName("uniquePenteWrapper")[0].id.split("__");
        app.gameState.sessionName = sessionInfo[0];
        const myName = sessionInfo[1];
        console.log(app.gameState.sessionName);
        socket.emit("initSession", JSON.stringify({ gameState: app.gameState, myName }));
    },
    // popConnectionStatus:()=>{
    //     console.log("popConnectionStatus ?");
    //     socket.emit("popConnectionStatus",{sessionName:app.session.name});
    // }
}
document.addEventListener("DOMContentLoaded", app.init);

// document.addEventListener("visibilitychange", app.popConnectionStatus);
/* Créer ici une requête html */
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


                // Player: class {
                //     static list = [];
                //     static dictionary = {};
                //     name = "";
                //     id = "";
                //     ip = "";
                //     index = -1;//sa place dans Player.list
                //     pairs = 0;
                //     move = [];//tuple
                //     /*         score=0; */
                //     color = "";
                //     constructor(socketId, color) {
                //         this.name = "";
                //         this.id = socketId;
                //         this.color = color;
                //         app.Player.dictionary[this.id] = this;
                //         // console.log(app.Player.dictionary);
                //         this.index = app.Player.list.length;//attention à l’ordre des lignes.
                //         app.Player.list.push(this);

                //     }
                // },