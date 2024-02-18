import { Entity } from "../cleo/core/entity";
import { Vec2 } from "../cleo/core/la";
import { SpriteSheet } from "../cleo/core/sprite_sheet";
import { Globals } from "../globals";
import { World } from "../world/world";

export class Bullet extends Entity{
    spr: SpriteSheet;
    velocity = new Vec2();
    world: World;
    constructor(frame: number){
        super();
        const tex = Globals.textureManager.get("characters");
        this.spr = new SpriteSheet(tex, 24, 24);
        this.spr.setTile(frame);
        this.world = Globals.world;
    }
    update(dt: number): void {
        //
        this.position.addMutate(this.velocity.mul(dt));
        if(this.world.isPositionSolid(this.position)) this.cleanup();
    }
    draw(): void {
        //
        this.spr.draw(this.position.x, this.position.y);
    }
}