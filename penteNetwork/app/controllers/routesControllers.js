// const xpr = require("express");
const {xpr}= require("../../srv");
const { Player, GameData, Session,GameLogic } = require("../model");

let sessions = {};
console.log(xpr);

/* view engine */
const { ViewR } = require("../../my_modules/viewr");

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
                        actionTitle: "Rejoindre une partie",
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
    /* 
    TODO tester */
    joinGame: (req, res) => {
        try {

            if (!req.query.game || !req.query.user) //si les variables de la requete sont undefined
                throw "Informations insuffisantes pour créer une partie.";

                
            const session = Session.list[req.query.game];
            //console.log(!session);
            if (!session)// si la session n’existe pas
                throw "Partie inexistante";

            /* Si les deux joueurs existent déjà mais que l’identité par ip ne correspond pas */
            //&& (session.owner && session.owner.ip !== req.ip));
            console.log(req.ip,session.guest,session.owner);
            if ((session.guest && (session.guest.ip !== req.ip || session.guest.name !== req.query.user))
                && (session.owner && (session.owner.ip !== req.ip || session.owner.name !== req.query.user)))
                throw "Vous n’êtes pas un des joueurs enregistrés pour cette partie."
            
                /* Si l’invité n’est pas créé, on le crée */
                console.log("SESSION.GUEST",typeof session.guest);
                if (!session.guest) {
                    const guest = new Player(req.query.user, req.ip);
                    guest.color = "yellow";
                    session.addPlayer(guest, "guest");
                    console.log(session.guest, session.playerDict[guest.name]);
                };
                /* si les données sont fournies pour la création d’un guest, on rejoint la partie */
                /* Si l’invité existe et que l’identité est vérifiée par l’ip on rejoint la partie */
                res.redirect(`/game/${session.name}/${encodeURI(session.guest.name)}`);
                

            }catch (e) {
                res.status(403).send(`Error 403 : denied. ${e}`);
            };
        },
        /* "/game/:session" */
        session: (req, res) => {
            // console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
            // console.log(req.ip, sessions[sessionName].gameData.activePlayer);
            const session = Session.list[req.params.game];
            //console.log("session logic => ", session.logic.state);
            // console.log("route session",Session.list);
            if (typeof session === "undefined" ||
                typeof session.owner === "undefined") {
                res.status(403).send("Error 403 : denied.");
            };

            /* dessiner le board */
            res.append("Content-Type", "text/html;charset=utf-8");
            res.status(200).send(ViewR.renderSync("views/game", { owner:session.owner.name, session, ip: req.ip, name: req.params.name }));
        },

}