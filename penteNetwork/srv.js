const xpr = require("express");
xpr.locals={};
const {Session} =require("./model/model");
const routes=require("./routes");
const socketioLogic=require("./controllers/socketioControllers");

const wbs_port = "4000";
const host = `http://localhost:${wbs_port}`;

const srv = xpr();

/* setting locals object */


/* websocket protocol handling server
see https://socket.io/get-started/chat
*/
const http = require("http");
const ioserver = http.createServer(srv);
const { Server } = require("socket.io");
const io = new Server(ioserver);
xpr.locals.io= io;

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
io.on("connection",(socket)=>{
/*
 TODO Ajouter feature de rejoin */
        console.log(`${socket.id} is connected.`);
        socket.on("moverequest",(e) => {
            e = JSON.parse(e);
            console.log(socket.rooms);
            io.to(e.gameState.session).emit("moveresponse", JSON.stringify(e));
        });
        /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
        TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
        entièrement en BACK  */
        socket.on("initSession",(e) => {
            // le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState
             const gameState = JSON.parse(e).gameState;
             const sessionName=gameState.session;
             console.log(`initSession : ${sessionName}`);
             socket.join(gameState.session);
            // console.log("currentSession",Session.list);
             io.to(gameState.session).emit("initRes",JSON.stringify({sessionData:Session.list[sessionName],ip:socket.handshake.address}));
             console.log(`${socket.id} joining game ${gameState.session}...`);
        });
        socket.on("disconnect",() => {
            console.log("User disconnected.");
        });
    
    
});

srv.use(routes);