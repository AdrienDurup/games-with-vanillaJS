module.exports=class Player {
    static list = [];
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.index = Player.list.length;
        Player.list.push(this);
    }
}