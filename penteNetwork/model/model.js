class Player {
    static list = [];
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.index = Player.list.length;
        Player.list.push(this);
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
module.exports={
     Player,
    GameData

}