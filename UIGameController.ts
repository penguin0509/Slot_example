import { _decorator, Button, Component, Game, game, Label, Node } from 'cc';
import { IGameManager } from './IGameManager';
import { GameStatus } from './GameManager';
import { WinController } from './WinController';
const { ccclass, property } = _decorator;
const OpenTurbo = "開啟Turbo";
const CloseTurbo = "關閉Turbo";

@ccclass('UIGameController')
export class UIGameController extends Component {

    @property(Label)
    protected balanceLabel: Label = null;

    @property(Label)
    protected betLabel: Label = null;

    @property(Button)
    protected spinButton: Button = null;

    @property(Button)
    protected autoButton: Button = null;

    @property(Button)
    protected betButton: Button = null;

    @property(Button)
    protected turboButton: Button = null;

    @property(WinController)
    protected winController: WinController = null;

    private gameManager: IGameManager = null;
    private normalWinScore: number = 0;
    private bigWinIndex: number = 0;
    private totalWin: number = 0;
    private multiplierSymbol: number = 0;
    private turboLabel: Label = null;
    private isTurbo: boolean = false;
    private onWinEnd: () => void = null;


    public setManager(manager: IGameManager) {
        this.gameManager = manager;
    }

    public init(betValue: number, onWinEnd: () => void) {

        this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClick, this);
        this.autoButton.node.on(Button.EventType.CLICK, this.onAutoClick, this);
        this.betButton.node.on(Button.EventType.CLICK, this.onBetClick, this);
        this.turboButton.node.on(Button.EventType.CLICK, this.onTurboClick, this);
        this.turboLabel = this.turboButton.getComponentInChildren(Label);
        this.onWinEnd = onWinEnd;
        this.winController.init(this.onWinEnd);
        this.setBetLabel(betValue);
    }


    start() {

        // this.spinButton.node.on(Button.EventType.CLICK, this.onSpinClick, this);
        // this.autoButton.node.on(Button.EventType.CLICK, this.onAutoClick, this);
        // this.betButton.node.on(Button.EventType.CLICK, this.onBetClick, this);
        // this.turboButton.node.on(Button.EventType.CLICK, this.onTurboClick, this);
        // this.turboLabel = this.turboButton.getComponentInChildren(Label);
    }

    public setGameStatus(status: GameStatus) {
        switch (status) {
            case GameStatus.Idle:
                this.setButtonInteractable(true);
                break;
            case GameStatus.WinCalculated:
                this.winController.setWin(this.normalWinScore, this.totalWin, this.bigWinIndex, this.multiplierSymbol);
                break;
            default:
                this.setButtonInteractable(false);
                break;
        }
    }

    public setWinData(normalScore: number, totalScore: number, bigWinIndex: number = -1, multiplierSymbol: number) {
        this.normalWinScore = normalScore;
        this.totalWin = totalScore;
        this.bigWinIndex = bigWinIndex;
        this.multiplierSymbol = multiplierSymbol;
    }

    private setButtonInteractable(interactable: boolean) {
        this.spinButton.interactable = interactable;
        this.autoButton.interactable = interactable;
        this.betButton.interactable = interactable;
    }


    public setBetLabel(value: number) {
        this.betLabel.string = '$' + value;
    }

    private onSpinClick() {
        this.gameManager?.onSpinClick();
    }
    private onAutoClick() {
        this.gameManager?.onAutoClick();
    }
    private onBetClick() {
        this.gameManager?.onBetClick();
    }
    private onTurboClick() {

        this.isTurbo = !this.isTurbo;
        this.setTurboLabel(this.isTurbo);
        this.gameManager?.onTurboClick(this.isTurbo);
    }


    private setTurboLabel(isTurbo: boolean) {
        this.turboLabel.string = isTurbo ? CloseTurbo : OpenTurbo;
    }

    protected onDestroy(): void {
        this.spinButton.node.off(Button.EventType.CLICK, this.onSpinClick, this);
        this.autoButton.node.off(Button.EventType.CLICK, this.onAutoClick, this);
        this.betButton.node.off(Button.EventType.CLICK, this.onBetClick, this);
        this.turboButton.node.off(Button.EventType.CLICK, this.onTurboClick, this);
    }

}




