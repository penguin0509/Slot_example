 export interface IGameManager {
    init(): void;

    onSpinClick(): void;

    onAutoClick(): void;

    onBetClick(): void;

    onTurboClick(isTurbo: boolean): void;

}


