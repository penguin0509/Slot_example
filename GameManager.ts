import { _decorator, Component, Game, Node } from 'cc';
import { UIGameController } from './UIGameController';
import { GameModel, ReelData } from './GameModel';
import { IGameManager } from './IGameManager';
import { ReelManager } from './ReelManager';
const { ccclass, property } = _decorator;
export enum GameStatus {
    Idle = 0,
    Spin = 1,
    AllReelStop = 2,
    WinCalculated = 3,

}

@ccclass('GameManager')
export class GameManager extends Component implements IGameManager {


    @property(UIGameController)
    protected uiController: UIGameController;
    @property(ReelManager)
    protected reelManager: ReelManager;

    private model: GameModel;
    private gameStatus: GameStatus = GameStatus.Idle;
    private isTurbo: boolean = false;

    private spinCount: number = 0;
    private currentBoardData: ReelData;
    private readonly CurrentBet: number = 100;

    start() {
        this.init();
    }

    init() {
        this.model = new GameModel();
        this.model.init();

        this.uiController.setManager(this);
        this.uiController.init(this.CurrentBet, () => this.onWinEnd());

        this.reelManager.initReel(() => this.onAllReelsStopEnd(), () => this.onShowSymbolEnd());


    }

    public onSpinClick() {

        this.onSpinStart();
    }
    public onAutoClick() {

    }
    public onBetClick() {

    }
    public onTurboClick(isTurbo: boolean) {
        this.isTurbo = isTurbo;
    }

    private onSpinStart() {
        console.log('onSpinStart');
        this.gameStatus = GameStatus.Spin;
        this.uiController.setGameStatus(this.gameStatus);
        this.reelManager.setGameSpeed(this.isTurbo);
        this.reelManager.startReel();
        this.setResult();
    }

    private setResult() {

        let data = this.model.getReelData();
        this.currentBoardData = data[this.spinCount];
        let boardResult = data[this.spinCount].icons;
        let isForecast = this.currentBoardData.forecast && this.currentBoardData.normalScore > 0 && !this.isTurbo;
        this.reelManager.setReelResult(boardResult, isForecast);
        this.spinCount++;
        if (this.spinCount > data.length - 1) {
            this.spinCount = 0;
        }
    }

    private onAllReelsStopEnd() {
        this.setGameStatus(GameStatus.AllReelStop);
    }

    private onWinEnd() {
        this.setGameStatus(GameStatus.Idle);
    }

    private onShowSymbolEnd() {
        this.setGameStatus(GameStatus.WinCalculated);
    }

    private setWinCalculated() {
        if (this.currentBoardData.normalScore > 0) {
            const normalScore = this.currentBoardData.normalScore * this.CurrentBet;
            const totalScore = this.currentBoardData.totalScore * this.CurrentBet
            this.uiController.setWinData(normalScore, totalScore, this.currentBoardData.winType, this.currentBoardData.multiplierSymbol);
            this.uiController.setGameStatus(this.gameStatus);
        } else {
            this.setGameStatus(GameStatus.Idle);
        }
    }

    private setAllReelStop() {
        console.log("this.currentBoardData.normalScore = ", this.currentBoardData.normalScore);
        if (this.currentBoardData.normalScore > 0) {
            this.scheduleOnce(() => {
                this.reelManager.setWinResult(this.currentBoardData.lineData);
            }, 0.5);

        } else {
            this.setGameStatus(GameStatus.Idle);
        }
    }

    private setGameStatus(status: GameStatus) {
        this.gameStatus = status;

        switch (status) {
            case GameStatus.Idle:
            case GameStatus.Spin:
                this.uiController.setGameStatus(this.gameStatus);
                break;
            case GameStatus.AllReelStop:
                this.setAllReelStop();
                break;
            case GameStatus.WinCalculated:
                this.setWinCalculated();
                break;
        }
    }


}

