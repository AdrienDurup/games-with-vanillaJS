//const { io } = require("../../io");
const { GameLogic, Session } = require("../model");

const socketControllers = {
    moveRequest: (io, e) => {
        // console.log("THIS",this);
        const state = JSON.parse(e).gameState;
        const sessionName = state.sessionName;
        // const session=Session.list[state.sessionName];
        // console.log("GameLogic",GameLogic.dict);
        const game = GameLogic.dict[sessionName];
        game.state.activePlayer.move = state.activePlayer.move;
        game.state.lastMoveId = state.lastMoveId;
        // console.log(game);
        const lastMove = state.activePlayer.move;
        // console.log("lastMove : ",lastMove);
        game.state.moveMap[lastMove[0]][lastMove[1]] = state.activePlayer.name;
        // console.log(game.state.activePlayer.move);
        // console.log(game.state);
        GameLogic.checkVictory(game.state);
        if (game.state.victory !== "") {
            console.log(`Victory for ${game.state.activePlayer.name}`);
        };
        //GameLogic.changePlayer(game);

        console.log("game.state.toDelete", game.state.toDelete);
        io.to(sessionName).emit("moveResponse", JSON.stringify({ gameState: game.state }));
    },
    changePlayer: (io, e) => {  /* 
        TODO rapatrier gameState coté server */
        const sessionName = JSON.parse(e).sessionName;
        /* changement de joueur */
        const game = GameLogic.dict[sessionName];
        GameLogic.changePlayer(game);
        io.to(sessionName).emit("changePlayerResponse", JSON.stringify({ gameState: game.state }));
    },
    askForReset: (io, e) => {
        const sessionName = JSON.parse(e).sessionName;
        const game = GameLogic.dict[sessionName];

        const requyingPlayer = JSON.parse(e).playerName;
        if (!game.askReset) { /* test if has already been asked */
            /* crée un état d’attente */
            game.askReset = requyingPlayer;
            io.to(sessionName).broadcast.emit("askedForReset");
        } else if (game.askReset !== requyingPlayer) { /* if asked by different player, transform into acceptance */
            /* execute acceptNewGame() */
            socketControllers.acceptNewGame(io, e);
        };

    },
    acceptNewGame: (io, e) => {
        console.log("acceptance not implemented");
    },
    initSession: (io, socket, e) => {
        /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
        TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
        entièrement en BACK  */
        // le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState
        // le nom de joueur est récupéré depuis <BODY>.id et sert à déterminer app.me
        const obj = JSON.parse(e);
        const gameState = obj.gameState;
        const myName = obj.myName;
        const sessionName = gameState.sessionName;
        const gameLogic = GameLogic.dict[sessionName];
        console.log(`initSession : ${sessionName}`);
        socket.join(sessionName);

        /*Si la session existe toujours, on ajoute le socket au connection status à chaque refresh, chargement de partie */
        if (Session.list[sessionName])
            Session.list[sessionName].connectionStatus.push(socket.id);

        // console.log("currentSession",Session.list);
        /* Pour l’initialisation on envoie que vers le socket appelant */
        socket.emit("initRes", JSON.stringify({ sessionData: Session.list[sessionName], ip: socket.handshake.address, myName }));
        // Mais on envoie partout la mise à jour des players boards
        io.to(sessionName).emit("updatePlayerBoard", JSON.stringify({ sessionData: Session.list[sessionName] }));
        // io.to(sessionName).emit("updatePlayerBoard",JSON.stringify({ gameState }));
        //  io.to(sessionName).emit("initRes",JSON.stringify({sessionData:Session.list[sessionName],ip:socket.handshake.address,myName}));
        console.log(`${socket.id} joining game ${sessionName}...`);
    },
    disconnect: (socket) => {
        const sessionNameList = Object.keys(Session.list);
        console.log(`sessions running : ${sessionNameList}`);
        for (key in Session.list) {
            /* dans chaque session on cherche si la propriété connectionStatus comporte le socket courant */
            const session = Session.list[key];
            const hasSocket = session.connectionStatus.find(el => el === socket.id);
            /* si le socket est trouvé on l’efface */
            if (hasSocket) {
                console.log(session.connectionStatus);
                session.connectionStatus = session.connectionStatus.filter(el => el !== socket.id);
                console.log(session.connectionStatus.length);
                /* si connectionStatus est vide on détruit la session */
                if (session.connectionStatus.length === 0) {
                    delete Session.list[key];
                    delete GameLogic.dict[key];
                    console.log(Session);
                    console.log(GameLogic);
                    const nbRemaining = Object.keys(Session.list).length;
                    console.log(`session deleted : ${nbRemaining} remaining sessions.`);
                };
            };
        };
        console.log("User disconnected.");
    }
}
module.exports = { socketControllers };

