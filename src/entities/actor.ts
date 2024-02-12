import { AABB } from "../cleo/core/aabb";
import { Entity } from "../cleo/core/entity";
import { Vec2 } from "../cleo/core/la";
import { World } from "../world/world";

export abstract class Actor extends Entity{
    velocity = new Vec2();
    acceleration = new Vec2();
    world: World;
    aabb: AABB;
    grounded = false;
    constructor(world: World, width: number, height: number){
        super();
        this.world = world;
        this.aabb = new AABB(this.position, width, height);
    }
    update(dt: number): void {
        // split acceleration into two for time step reasons
        this.velocity.addMutate(this.acceleration.mul(dt * 0.5));
        // move and collide with world, updating velocity accordingly
        const col = {aabb: this.aabb, velocity: this.velocity.mul(dt), grounded: false};
        this.world.move(col);
        this.grounded = col.grounded;
        this.velocity = col.velocity.mul(1/dt);
        this.velocity.addMutate(this.acceleration.mul(dt * 0.5));
    }
};
