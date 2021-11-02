const xpr = require("express");
xpr.locals = {};
const { Session } = require("./model/model");
const routes = require("./routes");
const socketioLogic = require("./controllers/socketioControllers");

const wbs_port = "4001";
// const host = `http://localhost:${wbs_port}`;

const srv = xpr();

/* setting locals object */


/* websocket protocol handling server
see https://socket.io/get-started/chat
*/
const http = require("http");
const ioserver = http.createServer(srv);
const { Server } = require("socket.io");
const { GameLogic } = require("./gameLogic");
// const {GameLogic} = require("./gameLogic");
const io = new Server(ioserver);
xpr.locals.io = io;

/* dans express, app.listen() crée le server under the hood
ce qui n’est pas toujours souhaitable, auquel cas il faut utiliser le module HTTP.
app=express() n’est pas un server mais son …"framework"?
*/
ioserver.listen(wbs_port, () => {
    console.log("Pente server running");
});

/* on écoute les sockets */
// io.on("connection",socketioLogic.connection);

/* Défactorisation pour test */
io.on("connection", (socket) => {
    /*
     TODO Ajouter feature de rejoin avec update ip et socket si besoin */
    console.log(`${socket.id} is connected.`);
    socket.on("moverequest", (e) => {
        const state = JSON.parse(e).gameState;
        const sessionName=state.sessionName;
        // const session=Session.list[state.sessionName];
        // console.log("GameLogic",GameLogic.dict);
        const game=GameLogic.dict[sessionName];
        game.state.activePlayer.move=state.activePlayer.move;
        game.state.lastMoveId=state.lastMoveId;
        // console.log(game);
        const lastMove=state.activePlayer.move;
        // console.log("lastMove : ",lastMove);
        game.state.moveMap[lastMove[0]][lastMove[1]]=state.activePlayer.name;
        // console.log(game.state.activePlayer.move);
        // console.log(game.state);
         GameLogic.checkVictory(game.state);
         if(game.state.victory!==""){
             console.log(`Victory for ${game.state.activePlayer.name}`);
         };
         //GameLogic.changePlayer(game);
         
        console.log("game.state.toDelete",game.state.toDelete);
        io.to(sessionName).emit("moveResponse", JSON.stringify({ gameState: game.state }));
    });
    
    socket.on("changePlayer", (e) => {
        /* 
        TODO rapatrier gameState coté server */
         const sessionName = JSON.parse(e).sessionName;
        // const session = Session.list[sessionName];
        /* changement de joueur */
        const game=GameLogic.dict[sessionName];
        GameLogic.changePlayer(game);
        io.to(sessionName).emit("changePlayerResponse", JSON.stringify({ gameState: game.state }));
    });

    /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
    TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
    entièrement en BACK  */
    socket.on("initSession", (e) => {
        // le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState
        // le nom de joueur est récupéré depuis <BODY>.id et sert à déterminer app.me
        const obj = JSON.parse(e);
        const gameState = obj.gameState;
        const myName = obj.myName;
        const sessionName = gameState.sessionName;
        const gameLogic=GameLogic.dict[sessionName];
        console.log(`initSession : ${sessionName}`);
        socket.join(sessionName);
        // console.log("currentSession",Session.list);
        /* Pour l’initialisation on envoie que vers le socket appelant */
        socket.emit("initRes", JSON.stringify({ sessionData: Session.list[sessionName], ip: socket.handshake.address, myName}));
       // Mais on envoie partout la mise à jour des players boards
        io.to(sessionName).emit("updatePlayerBoard",JSON.stringify({sessionData:Session.list[sessionName]}));
        // io.to(sessionName).emit("updatePlayerBoard",JSON.stringify({ gameState }));
        //  io.to(sessionName).emit("initRes",JSON.stringify({sessionData:Session.list[sessionName],ip:socket.handshake.address,myName}));
        console.log(`${socket.id} joining game ${sessionName}...`);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected.");
    });


});

srv.use(routes);