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

module.exports = { Session };