import { Graphics } from "cleo";
import { UINode } from "./ui_node";

/**
 * Scalable image for ui backgrounds and such
 */
export class UIImage extends UINode{
    texture: Graphics.Texture;
    constructor(parent: UINode | undefined, texture: Graphics.Texture){
        super(parent);
        this.texture = texture;
    }
    draw(x: number, y: number): void{
        const {width, height} = this.style;
        this.texture.draw(x, y, {width, height});
        super.draw(x, y);
    }
}