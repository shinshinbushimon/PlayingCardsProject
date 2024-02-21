import { BJTable } from './Table';
import { BJPlayer } from './Player';


let table1 = new BJTable("blackJack");
console.log("deck has " + table1.deck.cardDeck.length);

function addAndBetPlayers() {
    let player1: BJPlayer = new BJPlayer("shin", "user");
    let player2: BJPlayer = new BJPlayer("ai1", "ai"); 
    let player3: BJPlayer = new BJPlayer("ai2", "ai");
    let player4: BJPlayer = new BJPlayer("shin2", "user");
    
    table1.players.push(player1);
    table1.players.push(player2);
    table1.players.push(player3);
    table1.players.push(player4);

    console.log("-----Player1--------");
    console.log(player1.getBet);
    table1.haveTurn("betting", 50);
    console.log(player1.getBet);
    console.log("--------------------");

    console.log("-----Player2--------");
    console.log(player2.getBet);
    table1.haveTurn("betting", 100);
    console.log(player2.getBet);
    console.log("--------------------");

    console.log("-----Player3--------");
    console.log(player3.getBet);
    table1.haveTurn("betting");
    console.log(player3.getBet);
    console.log("--------------------");

    console.log("-----Player4--------");
    console.log(player4.getBet);
    console.log(BJTable.house.status);

    table1.haveTurn("betting", 10);
    console.log(player4.getBet);
    console.log("--------------------");

}

function displayCards(table: BJTable) {
    console.log("It's house!!!!!!");
    console.log(BJTable.house.getHandScore());
    console.log("///////////");

    for(let player of table.players) {
        console.log(player.getHandScore());
    }
}

// betting フェーズ
addAndBetPlayers();

table1.haveTurn("hit");
table1.haveTurn("stand");

table1.haveTurn();
table1.haveTurn();

table1.haveTurn("double");
console.log("oridinaryPlayer has Ace: " + table1.findPlayer().hands.filter(element => element.rank === "A").length);
table1.haveTurn("stand");


console.log(BJTable.house.status);
console.log(BJTable.gamePhase);

table1.haveTurn();
console.log(BJTable.playerDescription);
console.log(BJTable.house.status);

/*問題：
    houseに勝てない　⇒ houseのところの条件分岐通ってんのか。手札を確認する必要がある。
    userの外部からの連続アクションに対応できていない　actionフェーズじのuserがhitかdoubleの時だけ、turnを進行させないようにさせたい
    エースの含まれている数だけ、10を引くという処理ができていない⇒bustしたときに、エースの数だけ10引いて1にしてあげると、その関数では21になった時点で減算の終了
*/
displayCards(table1);
console.log("houseHasCars: " + BJTable.house.hands.length + " houseHasAce: " + BJTable.house.hands.filter(element => element.rank === "A").length);


