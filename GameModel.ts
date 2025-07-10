import { _decorator, Component, Node, randomRange } from 'cc';
import { WinLines } from './WinLines';
const { ccclass, property } = _decorator;
export enum WinType {
    None = -1,
    BigWin = 0,
    SuperWin = 1,
    MegaWin = 2,
    EpicWin = 3
}
@ccclass('GameModel')
export class GameModel {

    private readonly SymbolMaxIndex: number = 8;
    private readonly MultiplierMaxIndex: number = 13;
    private readonly MultiplierIndex: number = 10;
    private winLines: WinLines = new WinLines();
    private payTable: number[];
    private MultiplierPayTable: number[];

    private reelData: ReelData[] = [];

    public init() {
        this.winLines.setLineData();
        this.payTable = [25, 20, 15, 12, 10, 8, 5, 2];
        this.MultiplierPayTable = [1, 2, 3, 5, 10, 15];
        this.generateFakeData();
    }

    public getReelData() {
        return this.reelData;
    }

    private generateFakeData() {
        let fullBoard = new ReelData();
        fullBoard.icons = [0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 8];
        this.reelData.push(this.generateReelData(fullBoard.icons));

        let getScoreBoard = new ReelData();
        getScoreBoard.icons = [1, 2, 0, 1, 3, 0, 1, 5, 0, 8, 9, 10];
        this.reelData.push(this.generateReelData(getScoreBoard.icons));

        for (let i = 0; i < 4; i++) {
            this.reelData.push(this.generateReelData(this.getRandomBoard()));
            console.log(this.getRandomBoard());
        }
    }

    private getRandomBoard(): number[] {
        let randomArray = [];
        for (let i = 0; i <= (this.SymbolMaxIndex); i++) {
            let symbol = Math.floor(randomRange(0, this.SymbolMaxIndex));
            randomArray.push(symbol);
        }

        let randomIndex = 0;
        let multiplierArray = [];
        const maxMultiplierCount = 3;
        while (multiplierArray.length < maxMultiplierCount) {
            randomIndex = Math.floor(randomRange(this.SymbolMaxIndex, this.MultiplierMaxIndex + 1));
            if (multiplierArray.indexOf(randomIndex) === -1) {
                multiplierArray.push(randomIndex);
            }
        }
        let totalArray = randomArray.concat(multiplierArray);
        return totalArray;
    }

    private generateReelData(iconData: number[]): ReelData {
        let data = new ReelData();
        data.icons = iconData;
        data.lineData = this.setWinLine(data.icons);
        data.symbols = this.winLines.getMatchSymbol();
        data.multiplierSymbol = data.icons[this.MultiplierIndex];
        data.multiplierScore = this.getMultiplierScore(data.multiplierSymbol);
        data.forecast = this.check聽牌(data.multiplierSymbol);
        data.normalScore = this.checkWinScore(data.symbols);
        data.totalScore = data.normalScore * data.multiplierScore;
        data.winType = this.checkBigWin(data.totalScore);
        return data;
    }

    private setWinLine(result: number[]): number[][] {
        let lineData = this.winLines.checkWinLine(result);
        if (lineData.length > 0) {

            console.log("lineData = ", lineData[0]);
        }
        return lineData;
    }

    private checkWinScore(symbol: number[]): number {
        let totalScore = 0;
        for (let i = 0; i < symbol.length; i++) {
            totalScore += this.payTable[symbol[i]];
        }
        console.log("totalScore = ", totalScore);
        return totalScore;
    }

    private checkBigWin(score: number): WinType {
        if (score >= 37.5 && score <= 75) {
            return WinType.BigWin;
        }
        else if (score > 75 && score <= 112.5) {
            return WinType.SuperWin;
        }
        else if (score > 112.5 && score <= 150) {
            return WinType.MegaWin;
        }
        else if (score > 150) {
            return WinType.EpicWin;
        }
        return WinType.None;
    }

    private check聽牌(index: number): boolean {
        const 聽牌倍率 = this.MultiplierPayTable[3];
        // const 倍率 = this.倍率賠率表[index - this.SymbolMaxIndex];
        const 倍率 = this.getMultiplierScore(index);
        // console.log("聽牌倍率 = ", 聽牌倍率, "倍率 ="  , 倍率);
        if (倍率 >= 聽牌倍率) {
            return true;
        } else {
            return false;

        }
    }

    private getMultiplierScore(index: number): number {
        return this.MultiplierPayTable[index - this.SymbolMaxIndex];
    }
}

@ccclass('ReelData')
export class ReelData {
    public icons: number[];
    public lineData: number[][];
    public symbols: number[];
    public multiplierSymbol: number;
    public multiplierScore: number;
    public normalScore: number;
    public totalScore: number;
    public winType: WinType;
    public forecast: boolean = false;

}



