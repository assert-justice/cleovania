import { Vec2 } from "./la";
import { Pool } from "./pool";

export abstract class Entity{
    position: Vec2;
    pool?: Pool;
    constructor(){
        this.position = new Vec2();
    }
    init(): void{
        this.position.mul(0);
    }
    abstract update(dt: number): void;
    abstract draw(): void;
    cleanup(): void{
        this.pool?.remove(this);
    }
}