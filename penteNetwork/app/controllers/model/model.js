// class Player {
//     static list = [];
//     constructor(name, socketid,ip) {
//         this.name = name;
//         this.id = socketid;
//         this.ip=ip;
//         this.index = Player.list.length;
//         Player.list.push(this);
//     }
//
class Player {
    // static list = [];
    // static dictionary = {};
    name = "";
    id = "";
    ip = "";
    index = -1;//sa place dans Player.list
    pairs = 0;
    move = [];//tuple
    label = "owner" || "guest" || "visitor";
    /*         score=0; */
    color = "";
    constructor(name, ip, socketId = "", color = "") {
        this.name = name;
        this.id = socketId;
        this.ip = ip;
        this.color = color;
        //Player.dictionary[this.id] = this;
        // console.log(app.Player.dictionary);
        //this.index = Player.list.length;//attention à l’ordre des lignes.
        //Player.list.push(this);
    }
}
class Session {
    static list = {};//changer pour dict
    static nextIndex=0;
    name;
    // index;
    playerList = [];
    playerDict = {};
    owner;// {} le créateur de la partie
    guest ;// {} son adversaire
    visitors=[];
    logic={};
    connectionStatus=[];//pour checker si les 2 joueurs sont connectés
    constructor(sessionName, owner,gameLogic) {
        this.name = sessionName;
        // this.owner = owner;
        // this.index= Session.nextIndex++;
        // console.log(this.index,Session.nextIndex);
        // this.playerList = [owner];
        // this.playerDict[owner.name] = owner;
        this.addPlayer(owner);
        gameLogic.state.sessionName=this.name;
        gameLogic.state.playerList=this.playerList;
        this.logic=gameLogic;
        // this.gameState= new GameData(owner);
        Session.list[this.name]=this;
        
    }
    addPlayer(player,label="owner"||"guest"||"visitor"){
      
        if(label==="owner"||"guest"){
            console.log(label);
        this[label]=player;
        this.playerDict[player.name]=player;
        player.index=this.playerList.length;//on définit l’index du joueur quand on l’ajoute à la session
        this.playerList.push(player);
        }else if(label==="visitor"){
            console.log(label);
            this.visitors.push(player);
        };
    }
}
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
}
module.exports = {
    Player,
    Session,
    GameData
}