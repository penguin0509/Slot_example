import { _decorator, Component, Node, CurveRange } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ReelSetting')
export class ReelSetting {
    //預報框
    @property
    public ForecastBoxSpeed: number = 0;
    //滾輪轉動最高速
    @property
    public MaximumSpeed: number = 0;
    //滾輪加速度
    @property
    public Acceleration: number = 0;
    //回彈曲線
    @property
    public Curve: CurveRange = new CurveRange();
    //回彈秒數
    @property
    public ReboundDuration: number = 0;
    //滾輪減速
    @property
    public SlowDownSpeed: number = 0

}


