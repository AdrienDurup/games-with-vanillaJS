const { Player, GameData } = require("../model/model");
const port = "3002";
const wbs_port = "4000";
const host = `http://localhost:${wbs_port}`;
// test = new Player("uop", "uei");
// console.log(test);
let sessions = {};


/* view engine */
const viewr = require("../my_modules/viewr");
// const viewr = require("./my_modules/viewrXpr");//template module shaped for express

//template module shaped for express
/*srv.engine("viewr",viewr);//viewr = conso.viewr
srv.set("view engine","viewr");
srv.set("views","views"); */

/* Routes logic */
module.exports={
    log:(req, res, next) => {
    console.log(`[${new Date().toISOString()} ${req.ip}] ${req.originalUrl}`);
    next();
},

root:(req, res) => {
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
},
session:(req, res) => {
    // console.log(`Route 1`); console.log(`MOVE ? ${req.query.move}`);
    // console.log(req.ip, sessions[sessionName].gameData.activePlayer);
    const sessionName = req.params.session;//ne fonctionne pas car param.session n’existe pas
    const session = sessions[req.params.session];
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403 : denied.");
    };

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
},

}