import { _decorator, Button, Component, Node, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { ScoreRolling } from './ScoreRolling';
import { MultiplierPerform } from './MultiplierPerform';
const { ccclass, property } = _decorator;
const DelayTime = 1.5;
const SymbolMaxIndex: number = 8
@ccclass('WinController')
export class WinController extends Component {

    @property(Node)
    protected bigWinRoot: Node = null;
    @property(Node)
    protected bigWinNode: Node = null;
    @property([SpriteFrame])
    protected bigWinSpriteFrames: SpriteFrame[] = [];
    @property(Sprite)
    protected bigWinSprite: Sprite = null;
    @property(ScoreRolling)
    protected bigWinScoreRolling: ScoreRolling = null;
    @property(Button)
    protected directButton: Button = null;

    @property(Node)
    protected normalWinRoot: Node = null;
    @property(ScoreRolling)
    protected normalWinScoreRolling: ScoreRolling = null;

    @property(MultiplierPerform)
    protected multiplierPerform: MultiplierPerform = null;

    private currentBigWinIndex: number = 0;
    private currentBigTween: Tween<Node> | null = null;
    private targetBigWinIndex: number = 0;
    private score: number = 0;
    private totalScore: number = 0;
    private multiplierIndex: number = 0;
    private onWinEnd: () => void = null
    private isDirect: boolean;



    onLoad(): void {
        this.setBigWinRootActive(false);
        this.setWinRootActive(false);
        this.directButton.node.on(Button.EventType.CLICK, this.onDirectClick, this);

    }

    public init(onWinEnd: () => void) {
        this.onWinEnd = onWinEnd
    }

    public setWin(score: number, totalScore: number, bigWinIndex: number = -1, multiplierSymbol: number) {
        this.score = score;
        this.totalScore = totalScore;
        this.targetBigWinIndex = bigWinIndex;
        this.multiplierIndex = multiplierSymbol - SymbolMaxIndex;

        this.showWin();
    }

    async showWin(): Promise<void> {
        const performTime = this.multiplierIndex > 0 ? 2 : 0.5;
        this.setWinRootActive(true);
        this.normalWinScoreRolling.addScore(this.score, 1, true);
        await this.delayTime(1.5);
        this.showMultiplierWin();
        await this.delayTime(performTime);
        await this.showBigWin();

    }

    async delayTime(sec: number): Promise<void> {
        return new Promise((resolve) => {
            this.scheduleOnce(resolve, sec);
        });
    }

    private showMultiplierWin() {
        if (this.multiplierIndex > 0) {
            this.setMultiplierPerform(() => {
                let diff = this.totalScore - this.score;
                this.normalWinScoreRolling.addScore(diff, 0.5, true);
            });
        }
    }

    async showBigWin(): Promise<void> {
        return new Promise((resolve) => {
            if (this.targetBigWinIndex > 0) {
                this.setBigWinIndex(this.targetBigWinIndex);
            } else {
                this.onWinEnd();
            }
            this.closeWin();
        });

    }

    private setBigWinIndex(index: number) {
        if (index < 0) {
            return;
        }
        this.showBigWinTween(this.currentBigWinIndex);
        this.currentBigWinIndex++;
        this.targetBigWinIndex = index;
        if (index > 0) {
            this.schedule(this.showBigWinPerform, 1, this.targetBigWinIndex - 1);
        } else {
            this.scheduleOnce(this.closeBigWin, DelayTime);
        }

        this.bigWinScoreRolling.addScore(this.totalScore);

    }

    private showBigWinPerform() {
        this.showBigWinTween(this.currentBigWinIndex);
        this.currentBigWinIndex++;
        if (this.currentBigWinIndex - 1 == this.targetBigWinIndex) {
            this.scheduleOnce(this.closeBigWin, DelayTime);
        }
    }

    private showBigWinTween(index: number) {

        if (index >= this.bigWinSpriteFrames.length) {
            console.error("index out of range")
            return;
        }

        this.bigWinNode.scale = new Vec3(0.5, 0.5, 0.5);
        this.setBigWinRootActive(true);
        this.setBigWinSpriteFrame(index);
        this.currentBigTween = null;
        this.currentBigTween = tween(this.bigWinNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    private onDirectClick() {
        if (!this.isDirect) {
            this.isDirect = true;
            Tween.stopAllByTarget(this.bigWinNode);
            this.setBigWinSpriteFrame(this.targetBigWinIndex);
            if (this.targetBigWinIndex > 0) {
                if (this.showBigWinPerform !== null) {

                    this.unschedule(this.showBigWinPerform);
                }

                if (this.closeBigWin !== null) {

                    this.unschedule(this.closeBigWin);
                }
                this.scheduleOnce(this.closeBigWin, DelayTime);
            }
            this.bigWinNode.setScale(Vec3.ONE);
        }
    }


    private closeWin() {
        this.setWinRootActive(false);
        this.normalWinScoreRolling.resetScore();
    }

    private closeBigWin() {
        this.setBigWinRootActive(false);
        this.targetBigWinIndex = 0;
        this.currentBigWinIndex = 0;
        this.currentBigTween = null;
        this.bigWinScoreRolling.resetScore();
        this.isDirect = false;
        this.onWinEnd();
    }

    private setWinRootActive(active: boolean) {
        this.normalWinRoot.active = active
    }

    private setBigWinRootActive(active: boolean) {
        this.bigWinRoot.active = active
    }

    private setBigWinSpriteFrame(index: number) {
        this.bigWinSprite.spriteFrame = this.bigWinSpriteFrames[index]
    }

    private setMultiplierPerform(cb?: () => void) {
        this.multiplierPerform.showPerform(this.multiplierIndex, cb)
    }


    onDestroy(): void {
        this.directButton.node.off(Button.EventType.CLICK, this.onDirectClick, this);
    }


}


