import { Card } from './Card';
import { GameDecision } from './GameDecision';
import { Player, BJPlayer, PhaseGamePlayer } from './Player';
import { BJDeck, Deck } from './Deck';

export interface Table{
    deck: Deck;
    gameType: string;
    players: Player[];

    incrementTurn(): void // turnを進行させるためのメソッド
    haveTurn(choiceAct?: string, betAmount?: number): void;
    initGame(): void;
    evaluateMove(player: Player, choiceAct?: string): void;
    hasFinishAllPlayer(): boolean;
    addPlayers(...newPlayers: Player[]): void;
    findPlayer(): Player;
    getActionOption(): string[];
    distributeCard(): void;
    userOrNot(): boolean;
    onFirstPlayer(): boolean;
    onLastPlayer(): boolean;

}

export interface havePhaseTable extends Table{
    players: PhaseGamePlayer[];
    getPlayerDescription(): string[];
    getHouse(): PhaseGamePlayer;
    getUser(): (PhaseGamePlayer | undefined);
    getBetOptions(): number[];
    getGamePhase(): string;
    getRound(): number;
    updatePlayerStatus(player: Player, betAmount: number): void;

}

export class BJTable implements havePhaseTable{
    static playerDescription: string[] = [];
    players: PhaseGamePlayer[] = [];
    gameType: string;
    deck: Deck = new BJDeck();
    static actionOption: string[] = ["surrender", "stand", "hit", "double"];
    static currentTurn: number = 0;
    static roundCount = 1;
    static gamePhase: string;
    static house: BJPlayer;
    static readonly betOptions: number[] = [5, 10, 20, 50, 100];
    private static secondCardWithHouse: Card; 

    constructor(gameType: string){
        this.gameType = gameType;
        BJTable.house = new BJPlayer("House", "house");
        this.initGame();
    }

    distributeCard(): void {
        for(let player of this.players) {
            player.hands.push(this.deck.drawOne());
            player.hands.push(this.deck.drawOne());
        }
    }

    addPlayers(...newPlayers: PhaseGamePlayer[]){
        this.players = this.players.concat(newPlayers);
    }

    getUser(){
        if(this.userOrNot()) {
            for(let player of this.players) {
                if(player.type === "user") return player;
            }
        }
        return undefined;
    }

    incrementTurn(){
        BJTable.currentTurn++;
    }

    incrementRound(){
        BJTable.roundCount++;
    }

    getHouse(){
        return BJTable.house;
    }

    getGamePhase(){
        return BJTable.gamePhase;
    }

    getRound(){
        return BJTable.roundCount;
    }

    getBetOptions(){
        return BJTable.betOptions;
    }

    getPlayerDescription(){
        return BJTable.playerDescription;
    }

    // acting続きから
    haveTurn(choiceAct?: string, betAmount?: number): void {
        let currentPlayer: PhaseGamePlayer = this.findPlayer();

        if(BJTable.gamePhase === "betting"){
            if(typeof betAmount === "undefined") betAmount = BJTable.betOptions[currentPlayer.getItem(BJTable.betOptions)];
            if(this.onFirstPlayer()) this.updateHouseStatus("Waiting for betting...");
            this.updatePlayerStatus(currentPlayer, betAmount); // 掛け金の初期化
            currentPlayer.status = "betting";
            currentPlayer.hands = [];

            if(this.onLastPlayer()) {
                this.updateHouseStatus("Waiting for acting");
                BJTable.gamePhase = "acting";
            }

        } else if (BJTable.gamePhase === "acting") {
            if(this.onFirstPlayer() && currentPlayer.status === "betting") {
                BJTable.house.hands.push(this.deck.drawOne());
                BJTable.secondCardWithHouse = this.deck.drawOne();
                this.distributeCard();       
            }
            
            const black = (currentPlayer.hands[0].bjRankNumber === 11 && currentPlayer.hands[1].bjRankNumber === 10);
            const jack = (currentPlayer.hands[0].bjRankNumber === 10 && currentPlayer.hands[1].bjRankNumber === 11);
            if(black || jack) currentPlayer.status = "blackjack";

            this.evaluateMove(currentPlayer, choiceAct);

            if(this.hasFinishAllPlayer()) {
                BJTable.house.hands.push(BJTable.secondCardWithHouse);
                const black = (BJTable.house.hands[0].bjRankNumber === 11 && BJTable.house.hands[1].bjRankNumber === 10);
                const jack = (BJTable.house.hands[0].bjRankNumber === 10 && BJTable.house.hands[1].bjRankNumber === 11);
                if(black || jack) BJTable.house.status = "blackjack";
                this.evaluateMove(BJTable.house); 
                this.winerEvaluating();

                BJTable.gamePhase = "winnerEvaluate";
            }
        } else if(!(this.userOrNot() && BJTable.gamePhase === "winnerEvaluate") || (BJTable.gamePhase === "winnerEvaluate" && currentPlayer.type === "user")){
            this.incrementRound();
            if(currentPlayer.getSavings <= 0) {
                BJTable.gamePhase = "gameOver";
                return;
                
            } else {
                this.initGame();
                this.initPlayer();
                return;
            }

        }

        this.incrementTurn();
    }

    initGame(): void {
        BJTable.gamePhase = "betting";
        BJTable.playerDescription = [];
        this.deck.generateDeck();
        this.deck.shuffleDeck();
        BJTable.currentTurn = 0;
        BJTable.house.hands = [];

    }


    initPlayer(){
        for(let player of this.players) {
            player.status = "betting";
            player.setBet = 0;
            player.hands = [];
            player.initWinAMount();
        }
    }

    evaluateMove(player: PhaseGamePlayer, choiceAct: string="stand"): void {
        if(player.status === "bust" || player.status === "surrender" || player.status === "blackjack") return; 

        if(player.type === 'user') {
            let gameDecision: GameDecision = player.makeDecision(choiceAct);
            this.updateHandsAndScore(player, gameDecision);
        } else { 
            this.updateNpc(player);
        }
        

    }

    userOrNot(){
        for(let player of this.players){
            if(player.type === "user") return true;
        }
        return false;
    }

    // 勝者判定
    winerEvaluating(){
        for(let player of this.players) {
            if(player.status === "bust" || player.status === "surrender" || player.status === "doubleBust") {
                player.changeWinAmount = -(player.getBet);

            } else if(player.status === "stand" || player.status === "doubleStand"){
                // stand
                if(this.modifyBusted(BJTable.house) < this.modifyBusted(player) || this.bustOrNot(BJTable.house)) {
                    player.changeWinAmount = (player.getBet);
                    
                    
                } else {
                    player.changeWinAmount = -(player.getBet);
                    
                }
                
            } else if(player.status === "blackjack"){
                player.changeWinAmount = Math.round(player.getBet*1.5);
                
            }

            player.changeSavings = player.getWinAmount;
            BJTable.playerDescription.push(this.createPlayerDescription(player));
        }

    }

    // userなら一度の処理確認、違うなら何回も
    updateHandsAndScore(player: PhaseGamePlayer, decision: GameDecision) {
        if(decision.choiceAct === 'hit' || decision.choiceAct === 'double') {
            if(decision.choiceAct === 'double') player.setBet = player.getBet*2;
            player.hands.push(this.deck.drawOne());
        }

        if(this.modifyBusted(player) > 21) player.status = decision.choiceAct === 'double' ? 'doubleBust' : 'bust';
        else player.status = decision.choiceAct === "double" ? "doubleStand" : decision.choiceAct;
    }

    // aiまたはhouseの自動化処理
    updateNpc(player: PhaseGamePlayer) {
        if(player.status === 'hit' || player.status === 'double' || player.status === "betting" || player.status === "Waiting for acting") {
            let decision: GameDecision = player.makeNpcDecision(this);
            player.status = decision.choiceAct;

            if(player.status === "hit" || player.status === "double") {
                if(decision.choiceAct === "double") player.setBet = player.getBet * 2;
                player.hands.push(this.deck.drawOne());
                if(this.modifyBusted(player) > 21) player.status = decision.choiceAct === 'double' ? 'doubleBust' : 'bust';
                else if(decision.choiceAct === "double") player.status = "stand";
                
                this.updateNpc(player);
            }
        }

    }

    modifyBusted(player: PhaseGamePlayer){
        if(this.bustOrNot(player)) {
            let score = player.getHandScore();
            for(let card of player.hands) {
                if(card.rank === "A") score -= 10;
                if(score <= 21) return score;
            }
        }

        return player.getHandScore();
    }


    hasFinishAllPlayer(): boolean {
        for(let player of this.players) {
            if(player.status === "betting" || player.status === "hit") return false;
        }

        return true;
    }


    bustOrNot(player: PhaseGamePlayer): boolean{
        return player.getHandScore() > 21;
    }

    // bettingフェーズ時のみ
    updatePlayerStatus(player: PhaseGamePlayer, betAmount: number){
        player.setBet = betAmount;
    }

    updateHouseStatus(houseStatus: string){
        BJTable.house.status = houseStatus;
    }

    findPlayer(){
        return this.players[BJTable.currentTurn % this.players.length];
    }

    onFirstPlayer(){
        return this.findPlayer() === this.players[0];
    }

    onLastPlayer(){
        return this.findPlayer() === this.players[this.players.length-1];
    }

    createPlayerDescription(player: PhaseGamePlayer) {
        return `
            name: ${player.name}, type: ${player.type}, bet: ${player.getBet}, winAmount: ${player.getWinAmount}, score: ${this.modifyBusted(player)}
        `;
    }

    getActionOption(): string[] {
        return BJTable.actionOption;
    }

}