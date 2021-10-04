const { Player, GameData } = require("./model/model");
test = new Player("uop", "uei");
console.log(test);
const xpr = require("express");

/* view engine */
const viewr = require("./my_modules/viewr");
// const viewr = require("./my_modules/viewrXpr");//template module shaped for express
const port = "3002";
const wbs_port = "4000";
const host = `http://localhost:${wbs_port}`;

const srv = xpr();


/* websocket protocol handling server
see https://socket.io/get-started/chat
*/
const http = require("http");
const ioserver = http.createServer(srv);
const { Server } = require("socket.io");
const io = new Server(ioserver);
xpr.locals = { io: io };


/* dans express, app.listen() crée le server under the hood
ce qui n’est pas toujours souhaitable, auquel cas il faut utiliser le module HTTP.
app=express() n’est pas un server mais son …"framework"?
*/

ioserver.listen(wbs_port, () => {
    console.log("Pente server running");
});



/* double sessions */
let sessions = {};


// srv.use(xpr.json());
// srv.use(xpr.urlencoded({extended:true}));


/* on définit les routes statiques */
srv.use(xpr.static("assets"));
srv.use((req, res, next) => {
    console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
    next();
});
/*
//template module shaped for express

srv.engine("viewr",viewr);//viewr = conso.viewr
srv.set("view engine","viewr");
srv.set("views","views"); */

/* on écoute les sockets */
io.on("connection", (socket) => {
    console.log("A user is connected.");
    socket.on("moverequest", (e) => {
        // console.log(e);
        e = JSON.parse(e);
        // console.log(e);
        if (e.gameState.activePlayer.index === e.gameState.playerList.length - 1) {
            e.gameState.activePlayer = e.gameState.playerList[0];
        } else {
            e.gameState.activePlayer = e.gameState.playerList[e.gameState.activePlayer.index + 1];
        };
        socket.broadcast.emit("moveresponse", JSON.stringify(e));
    });
    /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
    TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
    entièrement en BACK  */
    socket.on("initSession", (e) => {
        /* le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState */
         const gameState = JSON.parse(e).gameState;
         const sessionName=gameState.session;
         console.log(`initSession : ${sessionName}`);
        socket.join(gameState.session);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected.");
    });

});
/* création namespace et room pour la session */
// const sessions_ns = nameSpace = io.of(`/games`);
// sessions_ns.on(`sessionInit`, (socket) => {
//     console.log(`${socket.id} is connected.`);
// socket.join(`${sessionName}`);
// sessions_ns.to(`/${sessionName}`).emit("test");
// console.log(`${session.owner} is connected.`);
// });

srv.get("/", (req, res) => {
    /* on demande à l’utilisateur de créer une session ou de rejoindre une partie */
    if (typeof req.query.session === "undefined" || req.query.session === ""
        || typeof req.query.owner === "undefined" || req.query.owner === "") {
        res.status(200).send("Définir session avec ?session=&owner=");
    } else {
        /* on crée les données de session */
        const sessionName = req.query.session;
        const owner = new Player(req.query.owner, req.ip);
        sessions[sessionName] = {//A REVOIR
            sessionName: sessionName,
            playerList: [owner],
            owner: owner,
            guest: new Player("alterego", req.ip),
            gameData: new GameData(owner)
        };
        sessions[sessionName].playerList = [owner, this.guest];
        console.log(sessions[sessionName]);
        res.redirect(`/penteonline/${sessionName}`);
        // res.status(200).json(sessions[sessionName]);
    };
});

/* filtre d’accès à la session
TODO doit gérer les spectateurs */
/* srv.use((req,res,next)=>{
    const sessionName = req.params.session;//ne fonctionne pas car param.session n’existe pas
    const session = sessions[req.params.session];
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403 : denied.");
    };
    next();
}); */

srv.get("/penteonline/:session", (req, res) => {
    // console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
    // console.log(req.ip, sessions[sessionName].gameData.activePlayer);
    const sessionName = req.params.session;//ne fonctionne pas car param.session n’existe pas
    const session = sessions[req.params.session];
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403 : denied.");
    };

    /* INSERER ICI JOIN ROOM */


    /* si le joueur appelant est le joueur actif et qu’il a joué un coup 
    TO DO le déplacer dans la gestion des sockets ?*/
    if (req.ip === session.gameData.activePlayer.id
        && typeof req.query.json !== "undefined") {
        /* On récupère les coordonnées du coup */
        const reqObj = JSON.parse(req.query.json);
        console.log(reqObj);

        /* on change de joueur actif */
        console.log(session.gameData.list);
        session.gameData.changePlayer();
        console.log(session.gameData.activePlayer.name);
    };
    /* dessiner le board */
    res.append("Content-Type", "text/html;charset=utf-8");
    res.status(200).send(viewr.render("views/game.viewr", { test: 'Pente en dév', session: sessions[sessionName], host: host }));
    // res.status(200).render("game.viewr", { session: sessions[sessionName] });
});