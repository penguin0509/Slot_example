import { _decorator, Component, Node, RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreRolling')
export class ScoreRolling extends Component {
    @property(RichText)
    protected scoreText: RichText = null;
    private _currentScore: number = 0;
    private _targetScore: number = 0;
    private _duration: number = 1.5;

    public addScore(targetScore: number, duration = 1.5, isSign = false) {
        this._targetScore = this._currentScore + targetScore;
        this._duration = duration;

        const start = this._currentScore;
        const end = this._targetScore;
        const delta = end - start;

        let elapsed = 0;

        this.schedule((dt) => {
            elapsed += dt;
            const percent = Math.min(elapsed / this._duration, 1);
            const value = Math.floor(start + delta * percent);
            if (isSign) {

                this.scoreText.string = Number(value).toLocaleString();
            } else {

                this.scoreText.string = value.toString();
            }

            if (percent >= 1) {
                this.unscheduleAllCallbacks();
                this._currentScore = this._targetScore;
            }
        }, 0);
    }

    public resetScore() {
        this._currentScore = 0;
        this._targetScore = 0;
        this.scoreText.string = '0';
    }

}


