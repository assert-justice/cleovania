import { HashGrid2D } from "../cleo/core/data";
import { Vec2 } from "../cleo/core/la";
import { SpriteSheet } from "../cleo/core/sprite_sheet";
import { Globals } from "../globals";

export class World{
    lookup = new HashGrid2D(-1);
    tileSpr: SpriteSheet;
    tileWidth = 18;
    tileHeight = 18;
    constructor(){
        this.tileSpr = new SpriteSheet(Globals.textureManager.get("tiles"), this.tileWidth, this.tileHeight);
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
        for (const [key, value] of this.lookup.data.entries()) {
            if(value === -1) continue;
            const [cx,cy] = this.lookup.toCoord(key);
            this.tileSpr.idx = value;
            this.tileSpr.draw(cx*this.tileWidth,cy*this.tileHeight);
        }
    }
}