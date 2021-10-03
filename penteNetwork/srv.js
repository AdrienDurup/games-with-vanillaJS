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


/* double sessions */
let sessions = {};
// srv.locals.sessions = sessions;

class Player {
    static list = [];
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.index = Player.list.length;
        Player.list.push(this);
    }
}

/* A Revoir !!!! */
class GameData {
    constructor(player) {
        this.activePlayer = player;
        this.list = Player.list;
    }
    changePlayer = () => {
        if (Player.list[this.activePlayer.index + 1] !== undefined) {
            this.activePlayer = Player.list[this.activePlayer.index + 1];
        } else {
            this.activePlayer = Player.list[0];
        };
    }
};

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

srv.get("/", (req, res) => {
    /* on demande à l’utilisateur de créer une session ou de rejoindre une partie */
    if (typeof req.query.session === "undefined" || req.query.session === ""
        || typeof req.query.owner === "undefined" || req.query.owner === "") {
        res.status(200).send("Définir session avec ?session=&owner=");
    } else {
        /* on crée la session */
        const sessionName = req.query.session;
        const owner = new Player(req.query.owner, req.ip);
        sessions[sessionName] = {//A REVOIR
            sessionName: sessionName,
            playerList:[owner],
            owner: owner,
            guest: new Player("alterego", req.ip),
            gameData: new GameData(owner)
        };
        sessions[sessionName].playerList=[owner,this.guest];
        console.log(sessions[sessionName]);
        res.redirect(`/penteonline/${sessionName}`);
        // res.status(200).json(sessions[sessionName]);
    };
});

/* filtre d’accès à la session
TODO doit gérer les spectateurs */
srv.use((req,res,next)=>{
    const sessionName = req.params.session;
    const session = sessions[req.params.session];
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403 : denied.");
    };
    next();
});

srv.get("/penteonline/:session", (req, res) => {
    console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
    const sessionName = req.params.session;
    const session = sessions[req.params.session];
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403 : denied.");
    } else {
        console.log(req.ip, sessions[sessionName].gameData.activePlayer);
io.of(`/${sessionName}`).on(`connection`,()=>{
    socket.join(`${sessionName}`);
    io.of(`/${sessionName}`).to(`/${sessionName}`).emit("test");
    console.log(`${session.owner} is connected.`);
});


        /* si le joueur appelant est le joueur actif et qu’il a joué un coup */
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
    };
});

srv.use((req, res, next) => {
    /* check identité du joueur appelant
    si c’est le joueur actif : gestion du coup.
    Sinon : rejet avec notification*/
    next();
});

/* dans express, app.listen() crée le server under the hood
ce qui n’est pas toujours souhaitable, auquel cas il faut utiliser le module HTTP.
app=express() n’est pas un server mais son …"framework"?
*/
/* on écoute les sockets */
io.on("connection", (socket) => {
    console.log("A user is connected.");
    socket.on("moverequest", (e) => {
        // console.log(e);
        e = JSON.parse(e);
        console.log(e);
        if (e.gameState.activePlayer.index === e.gameState.playerList.length - 1) {
            e.gameState.activePlayer = e.gameState.playerList[0];
        } else {
            e.gameState.activePlayer = e.gameState.playerList[e.gameState.activePlayer.index + 1];
        };
        socket.broadcast.emit("moveresponse", JSON.stringify(e));
    });
    socket.on("disconnect", () => {
        console.log("User disconnected.");
    });
});
ioserver.listen(wbs_port, () => {
    console.log("Pente server running");
});
