/* Game Logic */
class GameLogic{
    static dict={};
    size=19;
    state={
        sessionName: "",//récuperer la valeur via l’ID de Body ?
        playerList: [],
        playerDictionary: {},
        activePlayer: {},
        lastMove: "",
        moveMap:[],
        toDelete:[],
        victory:""
    };
    constructor(sessionName){// TODO à dev
        /* forEach for of (?) passent par dessus les champs non initialisés 
        c’est pourquoi on utilise for loop */
        this.state.moveMap=new Array(this.size);//des colonnes X
        for (let i=0;i<this.state.moveMap.length;i++){
            this.state.moveMap[i]= new Array(this.size).fill("");//des colonnes Y
        };
        GameLogic.dict[sessionName]=this;
    }
//TODO passer ces fonctions en statique ?
    static checkVictory=(state)=>{//move is a tuple
        const axes = [
            [1, 0], [0, 1], [1, 1], [-1, 1]
        ];
        const move=state.activePlayer.move;
        console.log(state);
        for (let i = 0; i < axes.length; i++) {
            /* vérifie si on a aligné 5 pierres */
            let score = GameLogic.checkAxis(move,axes[i]);
            console.log(`score sur l’axe ${axes[i]} : ${score}`);
            /* Verifie si on vient de capturer des paires */
            GameLogic.checkPair(move,axes[i]);
            GameLogic.checkPair(move,[axes[i][0] * -1, axes[i][1] * -1]);
            if (score >= 5 || state.activePlayer.pairs >= 5) {
                state.victory=state.activePlayer.name;
                console.log(state);
                break;
            };
        };

    }
    static checkAxis=(move,axis)=>{//tuple from axes array
        let score = 1;
        /* compte les pierres dans un sens */
        score += GameLogic.checkOneDirection(move,axis);
        /* reverse : compte les pierres en sens inverse*/
        score += GameLogic.checkOneDirection(move,[axis[0] * -1, axis[1] * -1]);
        return score;
    }
    /* compte le nombre de pierres dans une direction en partant de la pierre jouée. */
    static checkOneDirection=(move,axis)=>{
        let score = 0;
        for (let i = 1; i < 5; i++) {
            const x = move[0] + axis[0] * i;
            const y = move[1] + axis[1] * i;
            if (state.moveMap[x][y] !== undefined//Si on est hors champ on doit breaker
                && state.moveMap[x][y] === state.activePlayer.name) {
                score++;
            } else {
                break;
            };
        };
        return score;
    }
    static checkPair=(move,axis)=>{
        let pairCheck = [];
        let isPairCheckValid = true;
        for (let i = 1; i < 4; i++) {
            const x = move[0] + axis[0] * i;
            const y = move[1] + axis[1] * i;
            let aheadCell = state.moveMap[x][y];
            if (aheadCell !== undefined) {
                pairCheck.push({position:[x,y],value:aheadCell});
            } else {
                isPairCheckValid = false;
            };

        }
        if (isPairCheckValid === true
            && pairCheck[0].value !== state.activePlayer.name
            && pairCheck[0].value === pairCheck[1].value
            && pairCheck[0].value !== ""
            && pairCheck[2].value === state.activePlayer.name
        ) {
            state.activePlayer.pairs++;
            console.log(state.activePlayer.pairs);
            state.toDelete(pairCheck[0].position);
            state.toDelete(pairCheck[1].position);
        };
    }
}

module.exports={GameLogic};