const { application } = require("express");
const xpr = require("express");
// const url=require("url");
const viewr = require("./my_modules/viewr");
const port = "3000";
const host = `http://localhost`;

const srv = xpr();

/* double sessions */
 let sessions = {};
// srv.locals.sessions = sessions;

srv.use(xpr.static("assets"));
// srv.set("view engine",viewr);
// srv.set("views","/views");

srv.get("/", (req, res) => {
    /* on demande à l’utilisateur de créer une session ou de rejoindre une partie */
    if (typeof req.query.session === "undefined" || req.query.session === ""
        || typeof req.query.owner === "undefined" || req.query.owner === "") {
        res.status(200).send("Définir session avec ?session=&owner=");
    } else {
        /* on crée la session */
        const sessionName = req.query.session;
        const owner = { name: req.query.owner, id: req.ip };
        const gameData = { activePlayer: owner.id };
        sessions[sessionName] = { owner: owner, guest: "", gameData: gameData };
        console.log(sessions[sessionName]);
        res.redirect(`/penteonline/${sessionName}`);
        // res.status(200).json(sessions[sessionName]);
    };
});

srv.get("/penteonline/:session", (req, res) => {
    const sessionName = req.params.session;
    if (typeof sessions[sessionName] === "undefined" ||
        typeof sessions[sessionName].owner === "undefined") {
        res.status(403).send("Erreur 403");
    } else {if(req.ip===sessions[sessionName].gameData.activePlayer){//si le joueur appelant est le joueur actif
        console.log(`${req.ip}===${sessions[sessionName].gameData.activePlayer}`)
    };
        /* dessiner le board */
        res.append("Content-Type", "text/html;charset=utf-8");
        res.status(200).send(viewr.render("views/game.vrmu", { session: sessions[sessionName] }));
        // res.status(200).render("game.viewr", { session: sessions[sessionName] });
    };
});

srv.use((req, res, next) => {
    /* check identité du joueur appelant
    si c’est le joueur actif : gestion du coup.
    Sinon : rejet avec notification*/

});

srv.listen(port, () => {
    console.log("Pente server running");
});