import { Card } from './Card';

export interface Deck{
    shuffleDeck(): void;
    cardDeck: Card[];
    drawOne(): Card;
    generateDeck(): void;
    hasAnyCard(): boolean;
}

export class BJDeck implements Deck{
    cardDeck: Card[] = [];
    constructor(){
        this.generateDeck();
    }
 
    public generateDeck(): void {
        const suits = ["♥", "♠", "♣", "♦"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        this.cardDeck = [];
        for(let suit of suits){
            for(let rank of ranks) {
                this.cardDeck.push(new Card(suit, rank));
            }
        }
    }

    // どうしてもcardかundefinedになる
    public drawOne(): Card{
        const output = this.cardDeck.shift();
        if(output instanceof Card) return output;
        else return new Card("", "");
    }

    public hasAnyCard(): boolean {
        return this.cardDeck.length > 0;
    }

    public shuffleDeck(): void {
        for (let i = this.cardDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cardDeck[i], this.cardDeck[j]] = [this.cardDeck[j], this.cardDeck[i]];
        }
    }
} 