/* Game Logic */
class GameLogic {
    static dict = {};
    size = 19;
    state = {
        sessionName: "",//récuperer la valeur via l’ID de Body ?
        playerList: [],
        playerDictionary: {},
        activePlayer: {},
        lastMoveId: "",
        moveMap: [],
        toDelete: [],
        victory: "",
        askReset: false,
    };
    constructor(sessionName) {// TODO à dev
        /* forEach for of (?) passent par dessus les champs non initialisés 
        c’est pourquoi on utilise for loop */
        this.state.moveMap = new Array(this.size);//des colonnes X
        for (let i = 0; i < this.state.moveMap.length; i++) {
            this.state.moveMap[i] = new Array(this.size).fill("");//des colonnes Y
        };
        GameLogic.dict[sessionName] = this;
    }
     reset() {
        this.moveMap = [];
        this.toDelete = [];
        this.victory = "";
        this.lastMoveId = "";
        console.log("reset game");
        this.askReset = false;
        GameLogic.changePlayer(this);
    }
    static checkVictory = (state) => {//move is a tuple
        const axes = [
            [1, 0], [0, 1], [1, 1], [-1, 1]
        ];
        const move = state.activePlayer.move;
        state.toDelete = [];//on réinitialise
        // console.log(state);
        for (let i = 0; i < axes.length; i++) {
            /* vérifie si on a aligné 5 pierres */
            let score = GameLogic.checkAxis(move, state, axes[i]);
            console.log(`score sur l’axe ${axes[i]} : ${score}`);
            /* Verifie si on vient de capturer des paires */
            GameLogic.checkPair(move, state, axes[i]);
            GameLogic.checkPair(move, state, [axes[i][0] * -1, axes[i][1] * -1]);
            if (score >= 5 || state.activePlayer.pairs >= 5) {
                state.victory = state.activePlayer.name;
                // console.log(state);
                break;
            };
        };

    }
    static checkAxis = (move, state, axis) => {//tuple from axes array
        let score = 1;
        /* compte les pierres dans un sens */
        score += GameLogic.checkOneDirection(move, state, axis);
        /* reverse : compte les pierres en sens inverse*/
        score += GameLogic.checkOneDirection(move, state, [axis[0] * -1, axis[1] * -1]);
        return score;
    }
    /* compte le nombre de pierres dans une direction en partant de la pierre jouée. */
    static checkOneDirection = (move, state, axis) => {
        let score = 0;
        for (let i = 1; i < 5; i++) {
            const x = move[0] + axis[0] * i;
            const y = move[1] + axis[1] * i;
            // console.log(x,y);
            if (typeof state.moveMap[x] !== "undefined"//Si l’abscisse n’est pas hors champ
                && typeof state.moveMap[x][y] !== "undefined"//Si l’ordonnée n’est pas hors champ.
                && state.moveMap[x][y] === state.activePlayer.name) {
                score++;
            } else {
                break;
            };
        };
        return score;
    }
    static checkPair = (move, state, axis) => {
        let pairCheck = [];
        let isPairCheckValid = true;
        for (let i = 1; i < 4; i++) {
            const x = move[0] + axis[0] * i;
            const y = move[1] + axis[1] * i;
            let aheadCell;
            if (typeof state.moveMap[x] !== "undefined"//Si l’abscisse n’est pas hors champ
                && typeof state.moveMap[x][y] !== "undefined") {//Si l’ordonnée n’est pas hors champ.
                aheadCell = state.moveMap[x][y];
                pairCheck.push({ position: [x, y], value: aheadCell });
            } else {
                isPairCheckValid = false;
            };

        };
        console.log(state.activePlayer.name, pairCheck);
        if (isPairCheckValid === true
            && pairCheck[0].value !== state.activePlayer.name
            && pairCheck[0].value === pairCheck[1].value
            && pairCheck[0].value !== ""
            && pairCheck[2].value === state.activePlayer.name
        ) {
            state.activePlayer.pairs++;
            console.log(state.activePlayer.pairs);
            state.toDelete[0] = pairCheck[0].position;//première pierre à supprimer
            state.toDelete[1] = pairCheck[1].position;//seconde pierre à supprimer
            state.moveMap[pairCheck[0].position[0]][pairCheck[0].position[1]] = "";//on supprime dans moveMap
            state.moveMap[pairCheck[1].position[0]][pairCheck[1].position[1]] = "";//on supprime dans moveMap
            console.log("pierres à supprimer", state.toDelete);
        };
    }
    static changePlayer = (glogic) => {
        // console.log(glogic.state.activePlayer.index,glogic.state.playerList.length - 1);
        if (glogic.state.activePlayer.index === glogic.state.playerList.length - 1) {
            glogic.state.activePlayer = glogic.state.playerList[0];
        } else {
            glogic.state.activePlayer = glogic.state.playerList[glogic.state.activePlayer.index + 1];
        };
    }

}

module.exports = { GameLogic };