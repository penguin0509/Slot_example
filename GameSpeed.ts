import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSpeed')
export class GameSpeed {
    @property
    public ReelInterval: number = 0;

    @property
    public ForecastPopupDelay: number = 0;

    @property
    public ReelDuration: number = 0;
}


