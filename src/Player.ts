import { Card } from './Card';
import { GameDecision } from './GameDecision';
import { BJTable } from './Table';

export interface Player{
    readonly name: string;
    readonly type: string;
    status: string;
    hands: Card[];
}

export interface PhaseGamePlayer extends Player{
    get getBet(): number;
    set setBet(betAmount: number);
    get getWinAmount(): number;
    set changeWinAmount(winMoney: number);
    get getSavings(): number;
    set changeSavings(changeAmount: number);
    makeDecision(userChoiceAct: string): GameDecision;
    getHandScore(): number;
    makeNpcDecision(table: BJTable): GameDecision;
    getItem(options: (string | number)[]): number;
    initWinAMount(): void;

}

export class BJPlayer implements PhaseGamePlayer{
    public status: string;
    public hands: Card[];
    private bet: number;
    private winAmount: number;
    private savings: number;

    constructor(public readonly name: string, public readonly type: string, savings: number = 5000){
        this.status = "betting";
        this.hands = [];
        this.bet = 0;
        this.winAmount = 0;
        this.savings = savings;
    }

    public get getBet(){
        return this.bet;
    }

    public set setBet(betAmount: number){
        this.bet = betAmount;
    }

    public get getWinAmount() {
        return this.winAmount;
    }

    public set changeWinAmount(winMoney: number) {
        this.winAmount += winMoney;
    }

    public get getSavings(){
        return this.savings;
    }

    public set changeSavings(changeAmount: number){
        this.savings += changeAmount;
    }


    public makeDecision(userChoiceAct: string): GameDecision {
        return new GameDecision(userChoiceAct);
    }

    public getHandScore(){
        let output: number = 0;
        for (let card of this.hands) {
            output += card.bjRankNumber;
        }

        return output;
    }

    public makeNpcDecision(table: BJTable): GameDecision {
        const houseScore = table.getHouse().getHandScore();
        const choice = {
            init: ["surrender", "hit", "stand", "double"],
            offense: ["hit", "stand"],
            stand: "stand"
        }

        
        if(this.type.toLowerCase() === "ai") {
            
            if(this.status === "betting") {
                const aiAct = choice.init[this.getItem(choice.init)];
                return new GameDecision(aiAct);

            } else if(this.getHandScore() <= houseScore || this.getHandScore() <= 15) {
                const aiOffensiveChoice = choice.offense[this.getItem(choice.offense)];
                return new GameDecision(aiOffensiveChoice);

            } else return new GameDecision("stand");

        } else {

            // houseの挙動
            let strongers = table.players.filter(player => player.status === "stand" && player.getHandScore() > this.getHandScore()).length;
            if(strongers > 2) return new GameDecision(choice.offense[this.getItem(choice.offense)]);
            else return new GameDecision("stand");
        }

    }

    public getItem(options: (string | number)[]): number {
        return Math.floor(Math.random()*options.length);
    }

    public initWinAMount(): void {
        this.winAmount = 0;
    }




    
}

