import { _decorator, CCFloat, CCInteger, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Reel } from './Reel';
import { GameSpeed } from './GameSpeed';
const { ccclass, property } = _decorator;

@ccclass('ReelManager')
export class ReelManager extends Component {

    @property(CCInteger)
    protected rowCount: number = 0;
    @property(CCInteger)
    protected colCount: number = 0;
    @property(CCFloat)
    protected width: number = 0;
    @property(CCFloat)
    protected height: number = 0;
    @property(CCInteger)
    protected totalIconCount: number = 0;
    @property(Prefab)
    protected reel: Prefab = null;
    @property(GameSpeed)
    protected normalSpeed: GameSpeed = new GameSpeed();
    @property(GameSpeed)
    protected turboSpeed: GameSpeed = new GameSpeed();
    @property(Node)
    protected multiplierNode: Node = null;
    @property(Node)
    protected forecastNode: Node = null;

    private reels: Reel[] = [];
    private multiplierReel: Reel = null;
    private reelsPosition: Vec3[] = [];
    private positions: Vec3[] = [];
    private speed: GameSpeed = new GameSpeed();
    private isWaiting: boolean = false;
    private onAllReelStopEnd: () => void = null;
    private onShowSymbolEnd: () => void = null;
    private multiplierIndex: number;

    public initReel(onAllReelStopEnd: () => void, onShowSymbolEnd: () => void) {
        this.createReel();
        this.initReelsPosition();
        this.randomAllReel();
        this.onAllReelStopEnd = onAllReelStopEnd;
        this.onShowSymbolEnd = onShowSymbolEnd;
    }

    public randomAllReel() {
        for (let i = 0; i < this.reels.length; i++) {
            if (i == this.reels.length - 1) {
                this.reels[i].randomMultipleSymbol();
            } else {

                this.reels[i].randomSymbol();
            }
        }
    }

    async delayTime(sec: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(resolve, sec);
        });
    }

    public async startReel() {
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].startSlots();
        }
        await this.delayTime(this.speed.ReelDuration);
        await this.stopAllReel();
    }

    public setGameSpeed(isTurbo: boolean) {

        this.speed = isTurbo ? this.turboSpeed : this.normalSpeed;
    }

    public setReelResult(resultData: number[], isWaiting: boolean) {
        let index = 0;
        this.isWaiting = isWaiting;

        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.colCount; col++) {
                {
                    index = row * this.rowCount + col;
                    this.reels[row].setResult(col, resultData[index]);
                }
            }
        }


        for (let col = 0; col < this.colCount; col++) {
            index = (this.colCount * this.rowCount + col);
            this.reels[this.multiplierIndex].setResult(col, resultData[index]);
        }

    }

    public async setWinResult(winResultData: number[][]) {
        let index = 0;

        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.colCount; col++) {
                {
                    index = row * this.rowCount + col;
                    for (let w = 0; w < winResultData.length; w++) {
                        if (winResultData[w].indexOf(index) !== -1) {

                            this.reels[row].showWinSymbol(col + 1);
                        }
                    }
                }
            }
        }

        await this.delayTime(1);
        await this.showWinSymbol();

    }

    async showWinSymbol(): Promise<void> {
        return new Promise((resolve) => {
            this.onShowSymbolEnd();
        })
    }



    async stopAllReel(): Promise<void> {
        return new Promise((resolve) => {
            let index = 0;
            this.schedule(async () => {

                if (index < this.reels.length) {
                    if (index >= this.multiplierIndex) {

                        if (this.isWaiting) {
                            this.setWaiting();
                        } else {
                            this.reels[index].stopSlots();
                            await this.delayTime(0.5);
                            await this.setAllReelStopEnd();
                        }

                    } else {

                        this.reels[index].stopSlots();
                        index++;
                    }

                }


            }, this.speed.ReelInterval, this.reels.length - 1)
        })
    }

    async setWaiting(): Promise<void> {
        return new Promise(async (resolve) => {
            const closeForecastTime = this.speed.ForecastPopupDelay + this.reels.length * this.speed.ReelDuration;
            this.forecastNode.active = true;
            this.reels[this.multiplierIndex].setForecast(true);
            await this.delayTime(this.speed.ForecastPopupDelay);
            this.reels[this.multiplierIndex].stopSlots();
            await this.delayTime(closeForecastTime);
            await this.setAllReelStopEnd();

        })
    }

    private setAllReelStopEnd(): Promise<void> {
        return new Promise((resolve) => {
            this.forecastNode.active = false;
            this.reels[this.multiplierIndex].setForecast(false);
            this.onAllReelStopEnd();
        })

    }

    private createReel() {
        this.reels = new Array(this.rowCount);
        for (let i = 0; i < this.rowCount; i++) {
            let tempReel = instantiate(this.reel);
            this.node.addChild(tempReel);
            this.reels[i] = tempReel.getComponent(Reel);
        }

        let mulReel = instantiate(this.reel);
        this.multiplierNode.addChild(mulReel);
        this.multiplierReel = mulReel.getComponent(Reel);
        this.multiplierReel.isMultiplier = true;
        this.reels.push(this.multiplierReel);
        this.multiplierIndex = this.reels.length - 1;
    }

    private initReelsPosition() {
        this.reelsPosition = new Array(this.reels.length);
        this.positions = new Array(this.rowCount * this.colCount);
        let increase = new Vec3(this.width, 0, 0);
        let newPosition = new Vec3(-this.width * (this.rowCount / 2 - 0.5), 0, 0);
        for (let i = 0; i < this.rowCount; i++) {

            this.reels[i].node.setPosition(newPosition);
            this.reels[i].initSlot(this.colCount, this.height, this.totalIconCount);

            let index = 0;
            for (let j = 0; j < this.reels[i].Positions.length; j++) {
                index = j + this.rowCount + 1;
                this.positions[index] = this.reels[i].Positions[j];
            }
            this.reelsPosition[i] = this.reels[i].node.getPosition();
            newPosition = newPosition.add(increase);
        }

        this.multiplierReel.initSlot(this.colCount, this.height, this.totalIconCount);

    }






}


