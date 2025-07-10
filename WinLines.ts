import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WinLines')
export class WinLines {
    private lineData: number[][] = [];

    private line_1: number[] = [1, 4, 7];
    private line_2: number[] = [0, 3, 6];
    private line_3: number[] = [2, 5, 8];
    private line_4: number[] = [0, 4, 8];
    private line_5: number[] = [2, 4, 6];

    private matchSymbol: number[] = [];

    public setLineData() {
        this.lineData = [this.line_1, this.line_2, this.line_3, this.line_4, this.line_5];
    }

    public getMatchSymbol() {
        return this.matchSymbol;
    }

    public checkWinLine(boardData: number[]): number[][] {
        let matchedLines: number[][] = [];
        this.matchSymbol = [];
        for (const line of this.lineData) {
            const [a, b, c] = line;
            const symbol_1 = boardData[a];

            if (symbol_1 === boardData[b] && symbol_1 === boardData[c]) {
                matchedLines.push(line);
                this.matchSymbol.push(symbol_1);
            } else {
                

                if (symbol_1 === 0 && boardData[b] === boardData[c]) {
                    matchedLines.push(line);
                    this.matchSymbol.push(boardData[b]);
                }

                if (boardData[b] === 0 && symbol_1 === boardData[c]) {
                    matchedLines.push(line);
                    this.matchSymbol.push(symbol_1);
                }

                if (boardData[c] === 0 && symbol_1 === boardData[b]) {
                    matchedLines.push(line);
                    this.matchSymbol.push(symbol_1);
                }



                if (symbol_1 === 0 && boardData[b] === 0) {
                    matchedLines.push(line);
                    this.matchSymbol.push(boardData[c]);

                }

                if (symbol_1 === 0 && boardData[c] === 0) {
                    matchedLines.push(line);
                    this.matchSymbol.push(boardData[b]);

                }

                if (boardData[b] === 0 && boardData[c] === 0) {
                    matchedLines.push(line);
                    this.matchSymbol.push(symbol_1);
                }
            }


        }
        return matchedLines;
    }

}


