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
    // move = new Vec2();
    // jump = false;
    constructor(world: World, width: number, height: number){
        super();
        this.world = world;
        this.aabb = new AABB(this.position, width, height);
    }
    update(dt: number): void {
        // split acceleration into two for time step reasons
        this.velocity.addMutate(this.acceleration.mul(dt * 0.5));
        // move and collide with world, updating velocity accordingly
        this.vMove(dt);
        this.hMove(dt);
        this.velocity.addMutate(this.acceleration.mul(dt * 0.5));
    }
    private probe(vs: Vec2[], ox: number, oy: number){
        return vs.some(vec => {
            const coords = this.world.getCoords(vec);
            coords.x += ox;
            coords.y += oy;
            return this.world.isSolidCell(coords);
        });
    }
    vMove(dt: number){
        // yes, this seems way too complicated
        let minY = -Infinity;
        let maxY = Infinity;
        const topProbes: Vec2[] = [];
        const bottomProbes: Vec2[] = [];
        for(let px = 0; px < this.aabb.width; px += this.world.tileWidth){
            topProbes.push(new Vec2(this.position.x + px, this.position.y));
            bottomProbes.push(new Vec2(this.position.x + px, this.position.y + this.aabb.height));
        }
        if(this.probe(topProbes, 0, -1)) minY = this.world.getCoords(this.position).y * this.world.tileHeight;
        if(this.probe(bottomProbes, 0, 1)) {
            const pos = this.world.getCoords(this.position.add(new Vec2(this.aabb.width, this.aabb.height)));
            maxY = (pos.y + 0.99) * this.world.tileHeight - this.aabb.height;
        }
        this.position.y += this.velocity.y * dt;
        if(this.position.y < minY){
            this.position.y = minY; this.velocity.y = 0;
        }
        this.grounded = false;
        if(this.position.y > maxY){
            this.grounded = true;
            this.position.y = maxY; this.velocity.y = 0;
        }
    }
    hMove(dt: number){
        let minX = -Infinity;
        let maxX = Infinity;
        const leftProbes: Vec2[] = [];
        const rightProbes: Vec2[] = [];
        for(let py = 0; py < this.aabb.height; py += this.world.tileHeight){
            leftProbes.push(new Vec2(this.position.x, this.position.y + py));
            rightProbes.push(new Vec2(this.position.x + this.aabb.width, this.position.y + py));
        }
        if(this.probe(leftProbes, -1, 0)) minX = this.world.getCoords(this.position).x * this.world.tileWidth;
        if(this.probe(rightProbes, 1, 0)) {
            const pos = this.world.getCoords(this.position.add(new Vec2(this.aabb.width, this.aabb.height)));
            maxX = (pos.x + 0.99) * this.world.tileWidth - this.aabb.width;
        }
        this.position.x += this.velocity.x * dt;
        if(this.position.x < minX){
            this.position.x = minX; this.velocity.x = 0;
        }
        if(this.position.x > maxX){
            this.position.x = maxX; this.velocity.x = 0;
        }
    }
};
