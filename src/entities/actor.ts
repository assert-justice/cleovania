import { System } from "cleo";
import { AABB } from "../cleo/core/aabb";
import { Entity } from "../cleo/core/entity";
import { Vec2 } from "../cleo/core/la";
import { World, WorldCollision } from "../world/world";

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
        const col = this.world.move(this.position.x, this.position.y, this.aabb.width, this.aabb.height, this.velocity.x * dt, this.velocity.y * dt);
        this.velocity = new Vec2(col.dx, col.dy).mulMutate(1/dt);
        this.grounded = col.collidedBottom;
        this.velocity.addMutate(this.acceleration.mul(dt * 0.5));
        this.position = new Vec2(col.x, col.y);
        this.aabb.position = this.position;
    }
};
