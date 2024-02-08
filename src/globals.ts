import { InputManager, Key } from "./cleo/core/input_manager";
import { TextureManager } from "./cleo/core/texture_manager";

export class Globals{
    static readonly ViewWidth = 640;
    static readonly ViewHeight = 360;
    static inputManager: InputManager;
    static textureManager: TextureManager;
    static init(){
        this.inputManager = new InputManager();
        const moveAxis = this.inputManager.addAxis2D("move");
        moveAxis.xAxis
            .addKeyNegative(Key.a)
            .addKeyNegative(Key.left)
            .addKeyPositive(Key.d)
            .addKeyPositive(Key.right);
        moveAxis.yAxis
            .addKeyNegative(Key.w)
            .addKeyNegative(Key.up)
            .addKeyPositive(Key.s)
            .addKeyPositive(Key.down);
        this.inputManager.addButton("jump").addKey(Key.space);
        this.textureManager = new TextureManager()
            .add("characters", "./sprites/tilemap-characters_packed.png")
            .add("tiles", "./sprites/tilemap_packed.png")
            .add("backgrounds", "./sprites/tilemap-backgrounds_packed.png")
    }
}