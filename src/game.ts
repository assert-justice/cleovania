import { System } from "cleo";
import { Scene } from "./cleo/core/scene";
import { parseLdtk } from "./world/map_importer";
import { World } from "./world/world";

export class Game extends Scene{
    // player: Player;
    world: World;
    constructor(){
        super();
        this.world = parseLdtk(System.readFile("./maps/map.ldtk"));
        this.world.mount();
    }
    update(dt: number): void {
        // this.player.update(dt);
        this.world.update(dt);
    }
    draw(): void {
        this.world.draw();
        // this.player.draw();
    }
}