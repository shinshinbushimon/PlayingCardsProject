export class Card{
    constructor(public readonly suit: string, public readonly rank: string) {}

    get bjRankNumber(): number{
        const ranks = ["J", "Q", "K"];
        
        if(ranks.includes(this.rank)) return 10;
        else if(this.rank === "A") return 11;
        else return parseInt(this.rank);
    }
}