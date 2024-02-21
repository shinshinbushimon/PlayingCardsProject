import { CardGameView } from './CardGameView';
import { BJTable, havePhaseTable, Table } from './Table';
import { BJPlayer, PhaseGamePlayer, Player } from './Player';



export class CardGameController{

    processInitialForm(){
        CardGameView.addEventToForm((name: string, gameType: string) => {

            if(gameType === "blackjack") {
                let humanUser = (name.toLocaleLowerCase() !== 'ai') ? new BJPlayer(name, 'user') : new BJPlayer("Ai3", "ai");

                let table = new BJTable(gameType);
                table.addPlayers(new BJPlayer("Ai1", "ai"), humanUser, new BJPlayer("Ai3", "ai"));
                // 以降、renderTable(BJTable)の処理
                this.renderTable(table);


            } else if(gameType === "poker") {
                // blackjack以外のゲーム

            }
            
        });
    }

    // ドローというフェーズがあるのでcardAreaのdivをView側で保持し、参照できるように
    renderTable(table: havePhaseTable){
        const targetWard = "target";
        const outcomeWord = "display-outcome";
        const wholeOuter = "wholeOuter";

        CardGameView.changeRender(targetWard, CardGameView.renderFirst(table)); // 先んじてページのコア内容を表示

        if(table.findPlayer().type === "user" ||(!table.userOrNot() && table.onLastPlayer())) {

            const progressGame = (choiceAct?: string, betAmount?: number) => {
                table.haveTurn(choiceAct, betAmount);
                this.renderTable(table);
            };

            // betting画面の追加 ⇒ View側にあるbetInterfaceを作る関数を呼ぶ、その引数にはtable, renderTable(table)を引数に渡す
            if(table.getGamePhase() === "betting") {
                const calcFunc = CardGameController.reduceBetAMount(table);
                CardGameView.appendChild(targetWard, CardGameView.createBetting(table, progressGame, calcFunc)); // betting画面のノードを返す                

                // acting画面の追加
            } else if(table.getGamePhase() === "acting") { 
                //const actFunc = CardGameController.getActionOpt();
                let isFirstTurn = table.findPlayer().status === "betting";
                CardGameView.appendChild(targetWard, CardGameView.createActing(table, progressGame, isFirstTurn)); // acting画面のノードを返す

            } else if(table.getGamePhase() === "winnerEvaluate") {
                CardGameView.appendChild(targetWard, CardGameView.createroundOverBtn("OK", progressGame)); // 結果表示の時に表示するボタンを追加させる用
                CardGameView.appendChild(outcomeWord, CardGameView.createOutcome(table)); // ゲーム結果画面のノードを返す
                // htmlにあらかじめ結果表示領域用のdivを確保しておく
            } else if(table.getGamePhase() === "gameOver"){
                CardGameView.changeRender(wholeOuter, CardGameView.renderGameEnd());
                return;
            }
            
        } else {            
            setTimeout(() => {
                table.haveTurn();
                this.renderTable(table); // 更新された状態を表示します
            }, 5000);
        
        }
    }


    static getActionOpt() {
        let action = "stand";

        return (choiceAct?: string) => {
            if(choiceAct) action = choiceAct;
            return action;
        };
    }

    // 負の値なら-1をかけてそのまま渡す。
    static reduceBetAMount(table: havePhaseTable){
        let betOption = table.getBetOptions();

        return (betsArr: number[]) => {
            let betSum = 0;

            for(let i = 0; i < betOption.length; i++) {
                betSum += (betsArr[i] * betOption[i]);
            }

            return betSum;
        };
    }

}

let bjControll = new CardGameController();
bjControll.processInitialForm();