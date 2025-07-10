import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotSymbol')
export class SlotSymbol extends Component {
    @property(Node)
    protected symbol: Node = null
    @property(Sprite)
    protected sprite: Sprite = null
    @property([SpriteFrame])
    protected icons: SpriteFrame[] = [];

    private symbolAnimation: Animation = null

    onLoad() {

        this.symbolAnimation = this.node.getComponent(Animation);
    }

    public setSpriteFrame(index: number) {
        this.sprite.spriteFrame = this.icons[index];
    }

    public setPosition(position: Vec3) {
        this.symbol.setPosition(position);
    }

    public getPosition() {
        return this.symbol.position;
    }

    public playWinAnimation() {
        this.symbolAnimation.play('SymbolWin');
    }

    public playIdleAnimation() {
        this.symbolAnimation.play('SymbolIdle');
    }
}


