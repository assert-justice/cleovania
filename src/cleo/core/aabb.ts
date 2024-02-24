import { Vec2 } from "./la";

export class AABB{
    position: Vec2;
    offset: Vec2;
    width: number;
    height: number;
    constructor(position: Vec2, width: number, height: number, offset = new Vec2()){
        this.position = position; this.width = width; this.height = height; this.offset = offset;
    }
    collidePoint(pos: Vec2): boolean{
        if(pos.x < (this.position.x + this.offset.x) || pos.y < (this.position.y + this.offset.y)) return false;
        if(pos.x > (this.position.x + this.offset.x) + this.width || pos.y > (this.position.y + this.offset.y) + this.height) return false;
        return true;
    }
    collideBox(box: AABB): boolean{
        return (this.position.x + this.offset.x) < box.position.x + box.width &&
            (this.position.x + this.offset.x) + this.width > box.position.x &&
            (this.position.y + this.offset.y) < box.position.y + box.height &&
            (this.position.y + this.offset.y) + this.height > box.position.y;
    }
}