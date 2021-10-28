const xpr = require("express");
const { Player, GameData, Session } = require("../model/model");
const { GameLogic } = require("../gameLogic");
const wbs_port = "4001";
const host = `http://localhost:${wbs_port}`;
// test = new Player("uop", "uei");
// console.log(test);
let sessions = {};
xpr.locals.sessions = sessions;


/* view engine */
const { ViewR } = require("../my_modules/viewr");

/* Routes logic */
module.exports = {
    log: (req, res, next) => {
        console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
        next();
    },
    root: (req, res) => {
        /* 
        TODO commenter plus.
        TODO créer un middleware pour créer session si elle n’existe pas puis next : créer le joueur 
        */
        console.log(typeof req.query);
        if (Object.keys(req.query).length === 0) {
            res.status(200).send(ViewR.renderSync("views/index",
                {
                    start: {
                        actionTitle: "Nouvelle Partie",
                        userName: "Pseudo",
                        indexButton: "Créer",
                        action: "/create"
                    },
                    join: {
                        actionTitle: "Rejoindre Partie",
                        userName: "Pseudo",
                        indexButton: "Rejoindre",
                        action: "/join"
                    }
                }));
            return;
        };
    },
    createGame: (req, res) => {
        /* check si données de la query sont valides */
        if (typeof req.query.game !== "undefined" && req.query.game !== ""
            && typeof req.query.user !== "undefined" && req.query.user !== ""
            && typeof Session.list[req.query.game] === "undefined") {/* on check si la session n’existe pas déjà */

            /* on crée les données de session */
            const sessionName = req.query.game;
            const owner = new Player(req.query.user, req.ip);
            owner.label = "owner";
            owner.color = "red";
            myGameLogic = new GameLogic(sessionName);
            myGameLogic.state.activePlayer = owner;
            sessions[sessionName] = new Session(sessionName, owner, myGameLogic);
            // const myGame=new GameLogic();
            // console.log(sessions[sessionName]);
            res.redirect(`/game/${sessionName}/${encodeURI(owner.name)}`);
        } else {
            // Sinon on rejette l’accès à la création 
            res.status(403).send("Error 403 : denied.");
        };
    },
    joinGame: (req, res) => {
        if (req.query.game && req.query.game !== ""
            && req.query.user && req.query.user !== ""){
            const session = Session.list[req.query.game];
            if (session) {//si la session existe on crée le joueur invité et on rejoint
                const guest = new Player(req.query.user, req.ip);
                guest.color = "yellow";
                session.addPlayer(guest, "guest");
                console.log(session.guest, session.playerDict[guest.name]);
                res.redirect(`/game/${session.name}/${encodeURI(session.guest.name)}`);
                /* si les données sont fournies pour la création d’un guest, on rejoint la partie */
            } else {
                // Sinon on rejette l’accès 
                res.status(403).send("Error 403 : denied.");
            };
        } else {
            // Sinon on rejette l’accès
            res.status(403).send("Error 403 : denied.");
        };
    },
        /* "/game/:session" */
        session: (req, res) => {
            // console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
            // console.log(req.ip, sessions[sessionName].gameData.activePlayer);
            const session = Session.list[req.params.game];
            console.log("session logic => ", session.logic.state);
            // console.log("route session",Session.list);
            if (typeof session === "undefined" ||
                typeof session.owner === "undefined") {
                res.status(403).send("Error 403 : denied.");
            };

            /* dessiner le board */
            res.append("Content-Type", "text/html;charset=utf-8");
            res.status(200).send(ViewR.renderSync("views/game", { test: `Créée par ${session.owner.name}`, session, ip: req.ip, name: req.params.name, host: host }));
        },

}