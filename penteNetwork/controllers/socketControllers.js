module.exports={
    moverequest:(socket,e) => {
        // console.log(e);
        e = JSON.parse(e);
        // console.log(e);
        if (e.gameState.activePlayer.index === e.gameState.playerList.length - 1) {
            e.gameState.activePlayer = e.gameState.playerList[0];
        } else {
            e.gameState.activePlayer = e.gameState.playerList[e.gameState.activePlayer.index + 1];
        };
        // console.log(e.gameState.session);
        socket.to(e.gameState.session).emit("moveresponse", JSON.stringify(e));
    },

    initSession:(socket,e) => {
        /* le nom de session est récupéré depuis <BODY>.id et stocké dans app.gameState */
         const gameState = JSON.parse(e).gameState;
         const sessionName=gameState.session;
         console.log(`initSession : ${sessionName}`);
        //  socket.join(gameState.session);
         //socket.emit("initRes");
         socket.emit("initRes",JSON.stringify({test:"test"}));
         console.log(`${socket.id} joining game ${gameState.session}...`);
    },
    disconnect:() => {
        console.log("User disconnected.");
    }
}