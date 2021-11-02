module.exports={
    moverequest:(socket,e) => {
        e = JSON.parse(e);
        console.log(socket.rooms);
        io.to(e.gameState.session).emit("moveresponse", JSON.stringify(e));
    },
        /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
        TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
        entièrement en BACK  */
    initSession:(socket,e) => {
            /* le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState */
            const gameState = JSON.parse(e).gameState;
            const sessionName=gameState.session;
            console.log(`initSession : ${sessionName}`);
            socket.join(gameState.session);
            io.to(gameState.session).emit("initRes");
            console.log(`${socket.id} joining game ${gameState.session}...`);
    },
    disconnect:() => {
        console.log("User disconnected.");
    }
}