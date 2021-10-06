const socket = io();
socket.on("initRes", (e) => {
    try {
        const res = JSON.parse(e);
        console.log(res);

        const sessionData = res.sessionData;
        const myName = res.myName;
        /* we set the starting player - for the moment, owner of session */
        app.session = sessionData;
        console.log(sessionData.owner);
        app.gameState.activePlayer = sessionData.owner;
        console.log("init active player :", app.gameState.activePlayer.ip, app.gameState.activePlayer.name);
        app.me = sessionData.playerDict[myName];
        console.log(app.me);
    } catch (e) {
        console.error(e);
    }

})
socket.on("moveresponse", (e) => {
    app.gameState = JSON.parse(e).gameState;
    console.log(`STOUT`, app.gameState);
    const lastMoveCell = app.Cell.dictionary[app.gameState.lastMove];
    console.log(`current player is ${app.gameState.activePlayer.ip, app.gameState.activePlayer.name}`);
    /* on met à jour la vue de la dernière cellule jouée */
    lastMoveCell.update();
    /* on cherche le joueur actif dans le dictionnaire des joueurs dans Player.
    On teste sa victoire. */
    console.log(app.gameState.activePlayer.id, app.Player.dictionary);
    // app.Player.dictionary[app.gameState.activePlayer.id].checkVictory();
    // app.changePlayer();
    console.log("move response", app.gameState);
});

const app = {
    socket: socket,
    session: {},
    me: { index: "2" },//replaced by player object
    def: {
        author: "Gary Gabrel",
        size: 19,
    },
    /* 
    TODO faire un gameState "Event driven" avec système de snapshot et comparaison "onChange"
    TODO pour cela faire un singleton avec accesseurs
      */
    gameState: {
        sessionName: "",//récuperer la valeur via l’ID de Body ?
        playerList: [],
        playerDictionary: {},
        activePlayer: {},
        lastMove: "",
    },
    Player: class {
        static list = [];
        static dictionary = {};
        name = "";
        id = "";
        ip = "";
        index = -1;//sa place dans Player.list
        pairs = 0;
        move = [];//tuple
        /*         score=0; */
        color = "";
        constructor(socketId, color) {
            this.name = "";
            this.id = socketId;
            this.color = color;
            app.Player.dictionary[this.id] = this;
            // console.log(app.Player.dictionary);
            this.index = app.Player.list.length;//attention à l’ordre des lignes.
            app.Player.list.push(this);

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
            /* 
            TODO remplacer par une solution sans event listener et coté server
            */
            this.DOM.addEventListener("mouseenter", (e) => {
                // console.log("ok : "+`var(--stonePlayer${app.gameState.activePlayer.index})`);
                e.target.style
                    .setProperty("background-image", `var(--stonePlayer${app.me.index})`);
            });
            this.DOM.addEventListener("click", (this.handleCellPlay));
        }
        handleCellPlay = (e) => {
            console.log(`Cell id is ${e.target.id}`);
            console.log("Joueur actif ? ", app.gameState.activePlayer);
            console.log("my turn ?",app.gameState.activePlayer.ip+app.gameState.activePlayer.name,app.me.ip+app.me.name);
            if (app.gameState.activePlayer.ip+app.gameState.activePlayer.name !== app.me.ip+app.me.name) {
                return;
            };
            if (this.value === "") {
                console.log(`clic by ${app.gameState.activePlayer.id}`);

                app.gameState.lastMove = this.id;
                console.log("handleCellPlay : last move :", app.gameState.lastMove);
                /* On déclenche un évènement en lui passant l’état du jeu en donnée embarquée */
                socket.emit("moverequest", JSON.stringify({ gameState: app.gameState }));
            };
        }

        /* Permet d’update la vue de la cellule */
        update = () => {
            this.stoneContainer.className = `stone stone--j${app.gameState.activePlayer.index}`;
            console.log(this.stoneContainer.classList);
            console.log("IMPLEMENTER");
        }

    },

    changePlayer: () => {
        if (app.gameState.activePlayer.index === app.gameState.playerList.length - 1) {
            app.gameState.activePlayer = app.gameState.playerList[0];
        } else {
            app.gameState.activePlayer = app.gameState.playerList[app.me.index + 1];
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
        // app.gameState.playerList = app.Player.list;
        const sessionInfo=document.getElementsByTagName("body")[0].id.split("__");
        app.gameState.sessionName =sessionInfo[0];
    const myName=sessionInfo[1];
        console.log(app.gameState.sessionName);
        socket.emit("initSession", JSON.stringify({ gameState: app.gameState,myName }));
    }
}
document.addEventListener("DOMContentLoaded", app.init);


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