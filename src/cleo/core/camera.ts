import { Graphics } from "cleo";
import { Vec2 } from "./la";

export class Camera{
    view: Graphics.Texture;
    position = new Vec2();

    constructor(width: number, height: number){
        this.view = Graphics.Texture.new(width, height);
    }
    draw(x: number, y: number, fn: ()=>void){
        Graphics.pushTransform();
        Graphics.translate(-this.position.x + this.view.width / 2, - this.position.y + this.view.height / 2);
        fn();
        Graphics.popTransform();
        this.view.draw(x, y);
    }
}