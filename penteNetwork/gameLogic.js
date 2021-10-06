module.exports=function(){
    this.checkVictory=()=>{
        console.log("not implemented yet.");
        const axes = [
            [1, 0], [0, 1], [1, 1], [-1, 1]
        ];

        for (let i = 0; i < axes.length; i++) {
            /* vérifie si on a aligné 5 pierres */
            let score = this.checkAxis(axes[i]);
            console.log(`score sur l’axe ${axes[i]} : ${score}`);
            /* Verifie si on vient de capturer des paires */
            this.checkPair(axes[i]);
            this.checkPair([axes[i][0] * -1, axes[i][1] * -1]);
            if (score >= 5 || this.pairs === 5) {
                app.gameOver();
                break;
            };
        };

    },
    this.checkAxis=(axis)=>{//tuple from axes array
        let score = 1;
        /* compte les pierres dans un sens */
        score += this.checkOneDirection(axis);
        /* reverse : compte les pierres en sens inverse*/
        score += this.checkOneDirection([axis[0] * -1, axis[1] * -1]);
        return score;
    },
    /* compte le nombre de pierres dans une direction en partant de la pierre jouée. */
    this.checkOneDirection=(axis)=>{
        let score = 0;
        for (let i = 1; i < 5; i++) {
            const id = `cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`;
            if (app.Cell.dictionary[id] !== undefined//Si on est hors champ on doit breaker
                && app.Cell.dictionary[id].value === this.id) {
                score++;
            } else {
                break;
            };
        };
        return score;
    },
    this.checkPair=(axis)=>{
        let pairCheck = [];
        let isPairCheckValid = true;
        for (let i = 1; i < 4; i++) {
            const id = `cell_${this.move[0] + axis[0] * i}_${this.move[1] + axis[1] * i}`;
            let aheadCell = app.Cell.dictionary[id];
            if (aheadCell !== undefined) {
                pairCheck.push({ id: id, value: aheadCell.value });
            } else {
                isPairCheckValid = false;
            };

        }
        if (isPairCheckValid === true
            && pairCheck[0].value !== this.id
            && pairCheck[0].value === pairCheck[1].value
            && pairCheck[0].value !== ""
            && pairCheck[2].value === this.id
        ) {
            this.pairs++;
            console.log(this.pairs);
            app.deleteStone(pairCheck[0].id);
            app.deleteStone(pairCheck[1].id);
        };
    }
}