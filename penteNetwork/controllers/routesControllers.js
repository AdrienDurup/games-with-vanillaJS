const xpr = require("express");
const { Player, GameData, Session } = require("../model/model");
const port = "3002";
const wbs_port = "4000";
const host = `http://localhost:${wbs_port}`;
// test = new Player("uop", "uei");
// console.log(test);
let sessions = {};
xpr.locals.sessions = sessions;


/* view engine */
const viewr = require("../my_modules/viewr");
// const viewr = require("./my_modules/viewrXpr");//template module shaped for express

//template module shaped for express
/*srv.engine("viewr",viewr);//viewr = conso.viewr
srv.set("view engine","viewr");
srv.set("views","views"); */

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

        /* on demande à l’utilisateur de créer une session ou de rejoindre une partie */
        if (typeof req.query.session !== "undefined" && req.query.session !== ""
            && typeof req.query.owner !== "undefined" && req.query.owner !== "") {
            /* on check si la sessionn’existe pas déjà */
            if (typeof Session.list[req.query.session]==="undefined") {
                /* on crée les données de session */
                const sessionName = req.query.session;
                const owner = new Player(req.query.owner, req.ip);
                owner.label = "owner";
                sessions[sessionName] = new Session(sessionName, owner);
                // console.log(sessions[sessionName]);
                res.redirect(`/penteonline/${sessionName}`);
            }else{
                // Sinon on rejette l’accès à la création 
                res.status(403).send("Erreur 403 : denied.");
            };
           


        } else if (typeof req.query.session !== "undefined" && req.query.session !== ""
            && typeof req.query.guest !== "undefined" && req.query.guest !== "") {
            const session = sessions[req.query.session];
            if (session !== undefined) {
                session.guest = new Player(req.query.guest, req.ip);
                session.playerList.push(guest);
            };
            // console.log(sessions[sessionName]);
            res.redirect(`/penteonline/${sessionName}`);
        } else {
            res.status(200).send("Définir session avec ?session=&owner=");
        };
    },
    /* "/penteonline/:session" */
    session: (req, res) => {
        // console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
        // console.log(req.ip, sessions[sessionName].gameData.activePlayer);
        const session = Session.list[req.params.session];
        // console.log("route session",Session.list);
        if (typeof session === "undefined" ||
            typeof session.owner === "undefined") {
            res.status(403).send("Erreur 403 : denied.");
        };

        /* dessiner le board */
        res.append("Content-Type", "text/html;charset=utf-8");
        res.status(200).send(viewr.render("views/game.viewr", { test: 'Pente en dév', session, ip: req.ip, host: host }));
    },

}