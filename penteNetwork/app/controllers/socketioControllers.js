const socketCtrl=require("./socketControllers");
module.exports={
    connection:(socket) => {
        console.log(`${socket.id} is connected.`);
        socket.on("moverequest",(e)=>{socketCtrl.moverequest(socket,e)});
        /* quand la page de jeu charge on initialise la session socket.io avec le nom de session
        TO DO essayer de voir si on peut initialiser la room avant le chargement de la page, 
        entièrement en BACK  */
        socket.on("initSession",(e)=>{
            console.log(`entering initSession handler`);
            socketCtrl.initSession(socket,e);
            console.log(`quitting initSession handler`);
        });
        socket.on("disconnect",socketCtrl.disconnect);
    
    }
}