import { _decorator, Component, Node, CurveRange, Prefab, Vec3, instantiate, SpriteFrame, randomRange } from 'cc';
import { ReelSetting } from './ReelSetting';
import { SlotSymbol } from './SlotSymbol';
const { ccclass, property } = _decorator;

export enum ReelState {
    Stop,
    SpeedUp,
    TopSpeed,
    SlowDown,
    Rebound
}
@ccclass('Reel')
export class Reel extends Component {

    @property(Prefab)
    protected symbolPrefab: Prefab = null

    @property(ReelSetting)
    protected setting: ReelSetting = new ReelSetting();

    public isMultiplier: boolean = false
    public Positions: Vec3[] = [];

    private reelState: ReelState = ReelState.Stop;
    private slotSymbols: SlotSymbol[] = [];
    private topMostSlotCoordinate: number = 0;
    private currentSpeed: number = 0;
    private centerPosition: number = 0;
    private height: number = 0;
    private positionBuffer: Vec3 = new Vec3(0, 0, 0);
    private reboundTime: number = 0;
    private ratio: number = 0;
    private resultData: number[] = [];
    private iconIndex: number = 0;
    private totalIconCount: number = 0;
    private isStop: boolean = false;
    private isWaiting: boolean = false;


    public initSlot(visibleSymbol: number, distanceBetweenSlots: number, totalIconCount: number) {
        this.resultData = new Array(visibleSymbol);
        this.totalIconCount = totalIconCount;
        this.height = distanceBetweenSlots;
        this.topMostSlotCoordinate = (visibleSymbol + 1) * this.height * 0.5;
        this.createSymbol(visibleSymbol);

    }



    public randomSymbol() {
        for (let i = 0; i < this.slotSymbols.length; i++) {
            let randomIndex = Math.floor(Math.random() * this.totalIconCount);
            this.slotSymbols[i].setSpriteFrame(randomIndex);
        }
    }

    public randomMultipleSymbol() {
        let randomArray = [];
        let randomIndex = 0;
        while (randomArray.length < 4) {
            randomIndex = Math.floor(randomRange(8, 14));
            if (randomArray.indexOf(randomIndex) === -1) {
                randomArray.push(randomIndex);
            }
        }
        for (let i = 0; i < this.slotSymbols.length; i++) {

            this.slotSymbols[i].setSpriteFrame(randomArray[i]);

        }
    }

    public startSlots() {
        this.showAllSymbolsIdle();
        this.reelState = ReelState.SpeedUp;
        this.centerPosition = 0;
        this.currentSpeed = 1;
        this.isStop = false;
    }

    public stopSlots() {
        if (this.reelState !== ReelState.TopSpeed) {
            this.isStop = true;
            return;
        }
        if (this.isMultiplier && this.isWaiting) {
            this.currentSpeed = this.setting.SlowDownSpeed;
        }

        this.reelState = ReelState.SlowDown;
        this.reboundTime = 0;
    }

    public setResult(index: number, iconIndex: number) {
        this.resultData[index] = iconIndex;
    }

    public showWinSymbol(index: number) {
        this.slotSymbols[index].playWinAnimation();
    }

    public setForecast(isActive: boolean) {
        this.isWaiting = isActive;
    }


    private createSymbol(visibleSymbolCount: number) {
        let offsetSymbolCount = 2;
        let tempSymbolPosition = new Vec3(0, 0, 0);
        let totalSymbolCount = visibleSymbolCount + offsetSymbolCount;
        for (let i = 0; i < totalSymbolCount; i++) {
            let tempSymbol = instantiate(this.symbolPrefab);
            tempSymbol.setScale(Vec3.ONE);
            tempSymbolPosition = new Vec3(0, this.topMostSlotCoordinate - this.height * i, 0);
            tempSymbol.setPosition(tempSymbolPosition);
            this.node.addChild(tempSymbol);
            this.slotSymbols.push(tempSymbol.getComponent(SlotSymbol));
        }
    }

    private doSlowDown(deltaTime: number) {
        this.centerPosition -= this.currentSpeed;
        if (this.centerPosition <= 0) {
            if (this.iconIndex > this.resultData.length) {
                this.iconIndex = 0;
                this.reelState = ReelState.Rebound;
                this.doRebound(deltaTime);

            }
            else if (this.iconIndex == this.resultData.length) {
                this.resetCenterPosition();
                this.slotSymbols.splice(0, 0, this.slotSymbols.pop());
                this.changeRandomIcon();
                this.iconIndex++;
            }
            else {
                this.resetCenterPosition();
                this.slotSymbols.splice(0, 0, this.slotSymbols.pop());
                this.changeTargetIcon();
            }
        }
    }

    private doRebound(deltaTime: number) {
        this.reboundTime += deltaTime;
        this.ratio = this.reboundTime / this.setting.ReboundDuration;
        this.centerPosition = this.height * this.setting.Curve.evaluate(this.ratio, 1);
        if (this.reboundTime > this.setting.ReboundDuration) {
            this.centerPosition = 0;
            this.reelState = ReelState.Stop;
        }
    }



    private doSpeedUp() {
        this.currentSpeed += this.setting.Acceleration;
        this.centerPosition += this.currentSpeed;
        if (this.currentSpeed > this.setting.MaximumSpeed) {
            this.currentSpeed = this.setting.MaximumSpeed;
            this.reelState = ReelState.TopSpeed;
        }
        this.moveDown(this.currentSpeed);
    }

    private doTopSpeed() {
        if (this.isStop) {
            this.stopSlots();
        }

        this.currentSpeed = this.isWaiting ? this.setting.ForecastBoxSpeed : this.setting.MaximumSpeed;
        this.moveDown(this.currentSpeed);
    }


    private fixPosition() {
        for (let i = 0; i < this.slotSymbols.length; i++) {
            this.positionBuffer[i] = new Vec3(0, (this.topMostSlotCoordinate + this.centerPosition) - (this.height * i), 0);
            this.slotSymbols[i].node.setPosition(this.positionBuffer[i]);
        }
    }

    private moveDown(speed: number) {
        this.centerPosition -= speed;
        if (this.centerPosition <= 0) {
            this.resetCenterPosition();
            this.slotSymbols.splice(0, 0, this.slotSymbols.pop());
            this.changeRandomIcon();
        }
    }

    private changeRandomIcon() {
        let iconIndex = Math.floor(Math.random() * this.totalIconCount);
        if (this.isMultiplier === true) {
            iconIndex = Math.floor(randomRange(8, 14));
        }
        else {
            iconIndex = Math.floor(Math.random() * this.totalIconCount);
        }
        this.slotSymbols[0].setSpriteFrame(iconIndex);
    }

    private changeTargetIcon() {
        let index = this.resultData[this.resultData.length - 1 - this.iconIndex];
        this.slotSymbols[0].setSpriteFrame(index);
        this.iconIndex++;

    }

    private resetCenterPosition() {
        this.centerPosition += this.height;
        if (this.centerPosition <= 0) {
            this.centerPosition = 0;
        }
    }

    private showAllSymbolsIdle() {
        for (let i = 0; i < this.slotSymbols.length; i++) {
            this.slotSymbols[i].playIdleAnimation();
        }
    }


    update(deltaTime: number) {
        switch (this.reelState) {
            case ReelState.SpeedUp:
                this.doSpeedUp();
                this.fixPosition();
                break;
            case ReelState.TopSpeed:
                this.doTopSpeed();
                this.fixPosition();
                break;
            case ReelState.SlowDown:
                this.doSlowDown(deltaTime);
                this.fixPosition();
                break;
            case ReelState.Rebound:
                this.doRebound(deltaTime);
                this.fixPosition();
                break;

        }
    }
}




