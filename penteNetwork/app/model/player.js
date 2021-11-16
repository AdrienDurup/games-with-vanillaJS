class Player {
    name = "";
    id = "";
    ip = "";
    index = -1;//sa place dans Player.list
    pairs = 0;
    move = [];//tuple
    label = "owner" || "guest" || "visitor";
    /*         score=0; */
    color = "";
    constructor(name, ip, label = "visitor", color = "") {//socketId = ""
        this.name = name;
       // this.id = socketId;
        this.ip = ip;
        this.label = label;
        this.color = color;
    }
}
module.exports = { Player };