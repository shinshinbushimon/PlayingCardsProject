import { havePhaseTable, Table } from './Table';
import { Card } from './Card';
import { Player, PhaseGamePlayer } from './Player';

export class CardGameView{

    static addEventToForm(initTable: (name: string, gameType: string) => void){
        let formBtn = document.getElementById("initgame-btn")! as HTMLButtonElement;
        
        formBtn.addEventListener("click", (event) => {
            const userName = document.getElementById("username")! as HTMLInputElement;
            const gameType = document.getElementById("game-select")! as HTMLSelectElement;
            
            if(userName.value) initTable(userName.value, gameType.value);
            else alert("please put your name.");
            
        });
    }

    static changeRender(targetId: string, targetNode?: HTMLDivElement){
        let target = document.getElementById(targetId);
        if(target && targetNode) {
            target.innerHTML = "";
            target.append(targetNode);
        }

    }

    // betting画面の作成とreturn 
    static createBetting(
        table: havePhaseTable, 
        progressFunc: (choiceAct?: string, betAmount?: number) => void,
        calcBet: (Arr: number[]) => number){
    
        let bettingContainer = document.createElement("div");
        bettingContainer.classList.add("col-12", "d-flex", "flex-column", "align-items-center");
        let betOptionArea = CardGameView.betOptionsArea(table);

        let lastBtn = CardGameView.createButton("Submit your bet");
        CardGameView.addEventBets(betOptionArea, lastBtn, calcBet, "data-bet");

        lastBtn.querySelector("#formMsgArea")!.addEventListener("click", () => {
            let betInputs = Array.from(betOptionArea.querySelectorAll("input"));
            let betAmount = calcBet(CardGameView.getbetAMounts(betInputs));

            let user = table.getUser();
            if(user && user.getSavings < betAmount) alert("You don't have enough savings!!");
            else progressFunc(undefined, betAmount);
        });

        bettingContainer.append(betOptionArea);
        bettingContainer.append(lastBtn);

        return bettingContainer;
    }

    static renderFirst(table: havePhaseTable,){
        let container = document.createElement("div");
        container.classList.add("col-12", "d-flex", "justify-content-center", "align-items-center", "pt-2", "pb-4", "flex-wrap");
        container.append(CardGameView.addPlayerToPlayersArea(table.getHouse(), 1)); // houseの追加
        container.append(CardGameView.phasePlayersArea(table, 2)); // player達の表示領域
        return container;
    }

    static appendChild(parentId: string, child: HTMLDivElement){
        let parent = document.getElementById(parentId);
        if(parent) parent.append(child);
    }



    // 場合によってダミーカードを受け取る場合と実際のカードを受け取る場合がある
    static phasePlayersArea(table: havePhaseTable, firstHandsAmount: number){
        let playersContainer = document.createElement("div");
        playersContainer.classList.add("col-12", "d-flex", "justify-content-around", "py-2");


        for(let player of table.players) {
            playersContainer.append(CardGameView.addPlayerToPlayersArea(player, firstHandsAmount));
        }
        return playersContainer;

    }

    // Phaseのあるゲームplayerのareaへの追加
    // 人数とかはここで改修
    static addPlayerToPlayersArea(player: PhaseGamePlayer, firstHandsAmount: number){
        let playerContainer = document.createElement("div");
        playerContainer.classList.add("col-3", "d-flex", "justify-content-center", "flex-wrap");
        
        playerContainer.append(CardGameView.addNameToPlayersArea(player));
        playerContainer.append(CardGameView.createPlayerStatus(player));
        playerContainer.append(CardGameView.addCardsToCardArea(firstHandsAmount, ...player.hands));
        
        return playerContainer;

    }

    static addNameToPlayersArea(player: Player){
        let nameContainer = document.createElement("div");
        nameContainer.classList.add("col-12");
        nameContainer.innerHTML = 
            `
                <p class="text-center name-content">${player.name}</p>
            `
        ;
         
        return nameContainer;
        
    }


    // 更新した手札を、cardを付け足す.複数の値を想定しているので配列はアンパッキングして渡すこと
    static addCardsToCardArea(firstHandsAmount: number, ...cards: Card[]){
        let cardContainer = document.createElement("div");
        cardContainer.classList.add("col-12", "d-flex", "justify-content-around");
        if(cards.length > 0) firstHandsAmount = cards.length;
        for(let i = 0; i < firstHandsAmount; i++) {
            cardContainer.append(CardGameView.createPlayerCard(cards[i]));
        }

        return cardContainer;

    }

    // フェーズのあるゲーム用。statusを表示する。
    static createPlayerStatus(player: PhaseGamePlayer){
        let statusContainer = document.createElement("div");
        statusContainer.classList.add("col-12");


        let addContent = document.createElement("div");
        addContent.classList.add("col-11", "d-flex", "justify-content-around", "status-descript");
        addContent.innerHTML = 
            `
                <p>S:${player.status}</p>
                
            `
        ;
        if((player.type !== "house")) {
            addContent.innerHTML += 
                `
                    <p>B:${player.getBet}</p>
                    <p>S:${player.getSavings}</p>
                `
            ;
        }

        statusContainer.append(addContent);

        return statusContainer;
    }

    // cardを作って返す
    static createPlayerCard(card: Card){
        
        let cardContainer = document.createElement("div");

        let suit = "?";
        let rank = "?";

        if(typeof card !== "undefined") {
            suit = card.suit;
            rank = card.rank;
        }

        cardContainer.classList.add("bg-white", "py-1", "px-2", "cards", "d-flex", "flex-column", "align-items-center");
        let suitColor = (suit === "♥" || suit === "♦") ? "text-danger" : "text-dark";
        cardContainer.innerHTML = 
            `
                <h1 class="${suitColor}">${ suit }</h1>
                <p class="text-center text-dark mb-1">${ rank }</p>
            `
        ;
        return cardContainer;
    }

    static betOptionsArea(table: havePhaseTable){
        let buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("col-6", "d-flex", "pt-2", "pb-3", "justify-content-center");

        for(let betAmount of table.getBetOptions()) {
            let buttons = document.createElement("div");
            buttons.classList.add("d-flex", "flex-column", "col-3", "pl-0", "pr-0");
            buttons.innerHTML += 
                `
                    <div id="betBtn" class="d-flex flex-wrap form-group justify-content-center">
                        <button class="btn btn-danger col-3">-</button>

                        <input type="text" class="col-6" placeholder="3" value="0" data-bet=${ betAmount }>

                        <button class="btn btn-success col-3">+</button>
                        <p class="text-center">${ betAmount }</p>
                    </div>

                `
            ;

            buttonsContainer.append(buttons);
        }
        
        return buttonsContainer;
    }


    static addEventBets(
        betsContainer: HTMLDivElement, 
        getChagedElement: HTMLDivElement,
        calcBet: (arr: number[]) => number,
        dataAttribute: string
        ){

        let betsDivs = Array.from(betsContainer.querySelectorAll("#betBtn"));
        let betInputs = Array.from(betsContainer.querySelectorAll("input"));
        let buttonObj = getChagedElement.querySelector("#formMsgArea");
        const currentMsg = buttonObj!.innerHTML;

        for(let buttonContainer of betsDivs) {

            let betInput = buttonContainer.querySelector("input")! as HTMLInputElement;
            betInput.addEventListener("change", (event) => {
                // amountの直接変更
                if(getChagedElement) {
                    buttonObj!.innerHTML = `${currentMsg} $${calcBet(CardGameView.getbetAMounts(betInputs))}`;
                }
    
            });
    
            buttonContainer.querySelectorAll("button")[0].addEventListener("click", () => {
                betInput.value = (parseInt(betInput.value)-1) > 0 ? (parseInt(betInput.value)-1).toString() : "0";
                let event = new Event("change");
                betInput.dispatchEvent(event);
    
            });
    
            buttonContainer.querySelectorAll("button")[1].addEventListener("click", () => {
                betInput.value = (parseInt(betInput.value)+1).toString();
                let event = new Event("change");
                betInput.dispatchEvent(event);
            });
    
        }

    }

    static getbetAMounts(inputs: HTMLInputElement[]){
        let amounts: number[] = inputs.map(input => parseInt(input.value));
        return amounts;
    }

    

    static createButton(buttonWord: string){
        let bettingConfirmBtn = document.createElement("div");
        bettingConfirmBtn.classList.add("col-7", "text-light", "d-flex", "justify-content-center");
        let button: HTMLButtonElement = document.createElement("button");
        button.id = "formMsgArea";
        button.classList.add("btn", "btn-primary", "text-center");  //
        button.textContent = buttonWord;


        bettingConfirmBtn.append(button);

        
        return bettingConfirmBtn;
    }

 
    static createActing(
        table: havePhaseTable, 
        progressFunc: (choiceAct?: string, betAmount?: number) => void,
        isFirstTurn: boolean
        ) {

        let actionArea = CardGameView.createActionArea(table, isFirstTurn);

        let btnArr: HTMLButtonElement[] = Array.from(actionArea.querySelectorAll("button"));
        for(let btn of btnArr) {
            btn.addEventListener("click", () => {
                progressFunc(btn.value);
            });
        }
        
        return actionArea;
    }

    // 可用性のために後ほど改修
    static createActionArea(table: Table, isFirstTurn: boolean){
        let actionContainer = document.createElement("div");
        actionContainer.classList.add("col-8", "d-flex", "justify-content-center", "pt-4", "pb-5");
        let actions = table.getActionOption();

        if(isFirstTurn) actionContainer.append(CardGameView.actionBtn(actions[0], "light"));
        actionContainer.append(CardGameView.actionBtn(actions[1], "success"));
        actionContainer.append(CardGameView.actionBtn(actions[2], "warning"));
        if(isFirstTurn) actionContainer.append(CardGameView.actionBtn(actions[3], "danger"));

        return actionContainer;
    }

    static actionBtn(action: string, btnColor: string) {
        let actionBtn = document.createElement("button");
        actionBtn.classList.add("btn", `btn-${btnColor}`, "col-3");
        actionBtn.innerHTML = action;
        actionBtn.value = action;
        actionBtn.id = action;

        return actionBtn;
    }

    // roundカウンティングがいる
    static createOutcome(table: havePhaseTable){
        let descriptContainer = document.createElement("div");
        descriptContainer.classList.add("col-6");
        descriptContainer.innerHTML = `<p>round${ table.getRound() }:</p>`;

        let descriptContent = document.createElement("ul");
        for(let content of table.getPlayerDescription()) {
            let list = document.createElement("li");
            list.innerHTML = content;
            descriptContent.append(list);
        }

        descriptContainer.append(descriptContent);
        return descriptContainer;
    }

    static createroundOverBtn(buttonWord: string, progressGame: (choiceAct?: string, betAmount?: number) => void){
        let roundBtn = CardGameView.createButton(buttonWord);
        roundBtn.classList.add("roundOver-btnstyle");
        roundBtn.addEventListener("click", () => {
            progressGame();
        });

        
        return roundBtn;
    }

    static renderGameEnd(){
        let endGamePage = document.createElement("div");
        endGamePage.classList.add("bg-green", "col-12", "flex-wrap", "text-white", "vh-100");
        endGamePage.innerHTML = 
            `
                <h1>You can't keep playing...</h1>
                <p>Sorry for stopping the game suddenly. but you have no money</p>
            `
        ;
        return endGamePage;
    }


}