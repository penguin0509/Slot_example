import { _decorator, Component, Node, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MultiplierPerform')
export class MultiplierPerform extends Component {

    @property(Sprite)
    protected sprite: Sprite = null
    @property([SpriteFrame])
    protected icons: SpriteFrame[] = [];
    @property(UIOpacity)
    protected opacity: UIOpacity = null
    @property(Node)
    protected root: Node = null

    public showPerform(index: number, cb?: () => void) {
        this.setSpriteFrame(index);
        this.playWinAnimation(cb);
    }

    private setSpriteFrame(index: number) {
        if (index >= this.icons.length) {
            return;
        }
        this.sprite.spriteFrame = this.icons[index];
    }

    private playWinAnimation(cb?: () => void) {
        this.setOpacity(255);

        tween(this.node)
            .to(0.5, { position: this.root.position })
            .start();

        tween(this.opacity)
            .to(0.5, { opacity: 0 })
            .call(() => {
                this.reset();
                if (cb) {
                    cb();
                }
            })
            .start();

    }

    private setOpacity(opacity: number) {
        this.opacity.opacity = opacity;
    }

    private reset() {
        this.node.position = new Vec3(200, this.node.position.y, this.node.position.z);
        this.setOpacity(0);
    }
}


