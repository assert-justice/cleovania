import { System } from "cleo";
import { InputManager, JoyAxis, JoyButton, Key } from "./cleo/core/input_manager";
import { Pool } from "./cleo/core/pool";
import { TextureManager } from "./cleo/core/texture_manager";
import { Bullet } from "./entities/bullet";
import { parseLdtk } from "./world/map_importer";
import { World } from "./world/world";

export class Globals{
    static readonly ViewWidth = 640;
    static readonly ViewHeight = 360;
    static inputManager: InputManager;
    static textureManager: TextureManager;
    static world: World;
    static playerBulletPool: Pool;
    static init(){
        this.inputManager = new InputManager();
        const moveAxis = this.inputManager.addAxis2D("move");
        moveAxis.xAxis
            .addKeyNegative(Key.a)
            .addKeyNegative(Key.left)
            .addKeyPositive(Key.d)
            .addKeyPositive(Key.right)
            .addJoyAxis(0, JoyAxis.lx)
            .addJoyButtonNegative(0, JoyButton.d_left)
            .addJoyButtonPositive(0, JoyButton.d_right);
        moveAxis.yAxis
            .addKeyNegative(Key.w)
            .addKeyNegative(Key.up)
            .addKeyPositive(Key.s)
            .addKeyPositive(Key.down)
            .addJoyAxis(0, JoyAxis.ly)
            .addJoyButtonNegative(0, JoyButton.d_up)
            .addJoyButtonPositive(0, JoyButton.d_down);
        this.inputManager.addButton("jump").addKey(Key.space).addJoyButton(0, JoyButton.a);
        this.inputManager.addButton("fire").addKey(Key.tab).addJoyButton(0, JoyButton.x);
        this.textureManager = new TextureManager()
            .add("characters", "./sprites/tilemap-characters_packed.png")
            .add("tiles", "./sprites/terrain.png")
            .add("backgrounds", "./sprites/tilemap-backgrounds_packed.png")
        this.playerBulletPool = new Pool(()=>new Bullet(8));
        this.world = parseLdtk(System.readFile("./maps/map.ldtk"));
        this.world.mount();
    }
    static updatePools(dt: number){
        this.playerBulletPool.update(dt);
    }
    static drawPools(){
        this.playerBulletPool.draw();
    }
}