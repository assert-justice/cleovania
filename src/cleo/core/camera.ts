import { Graphics } from "cleo";
import { Vec2 } from "./la";
import { clamp } from "./math";

export class Camera{
    view: Graphics.Texture;
    position = new Vec2();
    targetPosition = new Vec2();
    smoothSpeed = 500;
    minX = -Infinity;
    maxX = Infinity;
    minY = -Infinity;
    maxY = Infinity;

    constructor(width: number, height: number){
        this.view = Graphics.Texture.new(width, height);
    }
    draw(x: number, y: number, fn: ()=>void){
        Graphics.pushTransform();
        Graphics.pushRenderTarget(this.view);
        Graphics.clear();
        Graphics.translate(-this.position.x + this.view.width / 2, - this.position.y + this.view.height / 2);
        fn();
        Graphics.popRenderTarget();
        Graphics.popTransform();
        this.view.draw(x, y);
    }
    update(dt: number){
        if(this.isOob(this.targetPosition)) this.clamp(this.targetPosition);
        const dist = this.position.distance(this.targetPosition);
        if(dist < 0.1) return;
        if(dist < this.smoothSpeed * dt){
            this.position = this.targetPosition;
            return;
        }
        const move = this.targetPosition.sub(this.position).normalize().mul(this.smoothSpeed * dt);
        this.position.addMutate(move);
    }
    clamp(pos: Vec2){
        pos.x = clamp(pos.x, this.minX, this.maxX);
        pos.y = clamp(pos.y, this.minY, this.maxY);
        return pos;
    }
    setPosition(position: Vec2){
        this.position = this.clamp(position.copy());
        this.targetPosition = position;
    }
    setTargetPosition(position: Vec2){
        this.targetPosition = this.clamp(position.copy());
    }
    isOob(pos: Vec2){
        if(pos.x < this.minX || pos.x > this.maxX) return true;
        if(pos.y < this.minY || pos.y > this.maxY) return true;
        return false;
    }
    resetExtents(){
        this.minX = -Infinity;
        this.maxX = Infinity;
        this.minY = -Infinity;
        this.maxY = Infinity;
    }
}