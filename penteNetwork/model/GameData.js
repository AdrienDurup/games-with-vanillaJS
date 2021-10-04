module.exports=class GameData {
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
};