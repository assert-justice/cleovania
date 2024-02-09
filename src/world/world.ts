import { Graphics } from "cleo";
import { HashGrid2D } from "../cleo/core/data";
import { Vec2 } from "../cleo/core/la";
import { SpriteSheet } from "../cleo/core/sprite_sheet";
import { Globals } from "../globals";
import { Player } from "../entities/player";
import { Camera } from "../cleo/core/camera";

export class World{
    lookup = new HashGrid2D(-1);
    tileSpr: SpriteSheet;
    tileWidth = 18;
    tileHeight = 18;
    // cameraPos = new Vec2();
    camera: Camera;
    player: Player;
    constructor(){
        this.tileSpr = new SpriteSheet(Globals.textureManager.get("tiles"), this.tileWidth, this.tileHeight);
        this.camera = new Camera(Globals.ViewWidth, Globals.ViewHeight);
        this.camera.position.x = Globals.ViewWidth/2; this.camera.position.y = Globals.ViewHeight/2;
        this.player = new Player(this, this.camera);
        this.player.position.x = 100; this.player.position.y = 100;
    }
    getCoords(vec: Vec2){
        const res = vec.copy();
        res.x = Math.floor(res.x / this.tileWidth);
        res.y = Math.floor(res.y / this.tileHeight);
        return res;
    }
    isSolidCell(vec: Vec2){
        return this.lookup.get(vec.x, vec.y) > -1;
    }
    isSolidPoint(vec: Vec2){
        return this.isSolidCell(this.getCoords(vec));
    }
    draw(){
        this.camera.draw(0, 0, ()=>{
            for (const [key, value] of this.lookup.data.entries()) {
                if(value === -1) continue;
                const [cx,cy] = this.lookup.toCoord(key);
                this.tileSpr.idx = value;
                this.tileSpr.draw(cx*this.tileWidth,cy*this.tileHeight);
            }
            this.player.draw();
        });
        // Graphics.pushTransform();
        // Graphics.translate(-this.cameraPos.x, -this.cameraPos.y);
        // for (const [key, value] of this.lookup.data.entries()) {
        //     if(value === -1) continue;
        //     const [cx,cy] = this.lookup.toCoord(key);
        //     this.tileSpr.idx = value;
        //     this.tileSpr.draw(cx*this.tileWidth,cy*this.tileHeight);
        // }
        // this.player.draw();
        // Graphics.popTransform();
    }
    update(dt: number){
        this.player.update(dt);
    }
}