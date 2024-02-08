import { Scene } from "./cleo/core/scene";
import { Player } from "./entities/player";
import { World } from "./world/world";

export class Game extends Scene{
    player: Player;
    world: World;
    constructor(){
        super();
        this.world = new World();
        this.player = new Player(this.world);
        this.player.position.x = 100; this.player.position.y = 100;
        const right = 35;
        const bottom = 19;
        // const right = 10;
        // const bottom = 10;
        this.world.lookup.setArea(0, 0, right, 0, 0);
        this.world.lookup.setArea(0, bottom, right, bottom, 0);
        this.world.lookup.setArea(0, 0, 0, bottom, 0);
        this.world.lookup.setArea(right, 0, right, bottom, 0);
        this.world.lookup.setArea(8, bottom-3, 10, bottom, 0);
    }
    update(dt: number): void {
        this.player.update(dt);
    }
    draw(): void {
        this.world.draw();
        this.player.draw();
    }
}