const server=require("./srv").server;
const { Server } = require("socket.io");
const io = new Server(server);
const {socketControllers} = require("./app/controllers/socketControllers");

/* Défactorisation pour test */
io.on("connection", (socket) => {
    /*
     TODO Ajouter feature de rejoin*/
    console.log(`${socket.id} is connected.`);

    socket.on("moverequest",(e)=>{socketControllers.moveRequest(io,e)});
    socket.on("changePlayer", (e) => {socketControllers.changePlayer(io,e)});
    socket.on("initSession", (e) => {socketControllers.initSession(io,socket,e)});
    socket.on("disconnect", ()=>{socketControllers.disconnect(socket)});
});

module.exports={io};