import { Graphics, System } from "cleo";
import { HashGrid2D } from "../cleo/core/data";
import { SpriteSheet } from "../cleo/core/sprite_sheet";
import { Globals } from "../globals";
import { Camera } from "../cleo/core/camera";
import { Vec2 } from "../cleo/core/la";
import { Player } from "../entities/player";
import { AABB } from "../cleo/core/aabb";

export interface WorldCollision{
    aabb: AABB,
    velocity: Vec2,
    grounded: boolean,
}

export class Segment{
    world: World;
    coords: Vec2;
    position: Vec2;
    tiles: [number,number,number][];
    camWalls: Set<string>;
    tex?: Graphics.Texture;

    constructor(world: World, coords: Vec2, tiles: [number,number,number][], camWalls: Set<string>){
        this.world = world; this.coords = coords; this.tiles = tiles; this.camWalls = camWalls;
        this.position = new Vec2(coords.x * world.segmentWidthTiles * world.tileWidth, coords.y * world.segmentHeightTiles * world.tileHeight, )
    }

    mount(){
        this.tex = Graphics.Texture.new(this.world.tileWidth * this.world.segmentWidthTiles, this.world.tileHeight * this.world.segmentHeightTiles);
        Graphics.pushRenderTarget(this.tex);
        const offsetX = this.coords.x * this.world.segmentWidthTiles;
        const offsetY = this.coords.y * this.world.segmentHeightTiles;
        for (const [tx, ty, idx] of this.tiles) {
            this.world.tileset.setTile(idx);
            this.world.tileset.draw((tx-offsetX)*this.world.tileWidth, (ty-offsetY)*this.world.tileHeight);
            // handle collision here too
            const tags = this.world.tileTags.get(idx);
            if(!tags) continue;
            if(tags.has("Solid")) this.world.collisionLookup.set(tx, ty, 0);
        }
        Graphics.popRenderTarget();
    }
    unmount(){
        this.tex = undefined;
    }
    draw(){
        this.tex?.draw(this.position.x, this.position.y);
    }
}

export class World{
    collisionLookup = new HashGrid2D(-1);
    segments = new HashGrid2D<Segment | undefined>(undefined);
    tileTags = new Map<number, Set<string>>();
    tileset: SpriteSheet;
    camera: Camera;
    tileWidth = 16;
    tileHeight = 16;
    segmentWidthTiles = 40;
    segmentHeightTiles = 22;
    segmentWidthPixels;
    segmentHeightPixels;
    player: Player;
    constructor(){
        this.segmentWidthPixels = this.segmentWidthTiles*this.tileWidth;
        this.segmentHeightPixels = this.segmentHeightTiles*this.tileHeight;
        this.tileset = new SpriteSheet(Globals.textureManager.get("tiles"), this.tileWidth, this.tileHeight);
        this.camera = new Camera(this.segmentWidthPixels, this.segmentHeightPixels);
        // this.camera.position.x = Globals.ViewWidth/2; this.camera.position.y = Globals.ViewHeight/2;
        this.camera.setPosition(new Vec2(this.segmentWidthPixels/2, this.segmentHeightPixels/2));
        this.player = new Player(this, this.camera);
        this.player.position.x = 100;
        this.player.position.y = 100;
    }
    draw(){
        this.camera.draw(0,0,()=>{
            for (const seg of this.segments.data.values()) {
                seg?.draw();
            }
            this.player.draw();
        });
    }
    update(dt: number){
        if(!this.camera.isOob(this.camera.position)) this.player.update(dt);
        const seg = this.getSegment(this.player.position);
        if(seg){
            const centerX = seg.position.x + this.segmentWidthTiles*this.tileWidth/2;
            const centerY = seg.position.y + this.segmentHeightTiles*this.tileHeight/2;
            this.camera.resetExtents();
            if(seg.camWalls.has("l")) this.camera.minX = centerX;
            if(seg.camWalls.has("r")) this.camera.maxX = centerX;
            if(seg.camWalls.has("t")) this.camera.minY = centerY;
            if(seg.camWalls.has("b")) this.camera.maxY = centerY;
        }
        this.camera.update(dt);
    }
    getCoords(position: Vec2){
        return new Vec2(Math.floor(position.x / this.tileWidth), Math.floor(position.y / this.tileHeight));
    }
    getSegment(position: Vec2){
        const coords = this.getCoords(position);
        const sx = Math.floor(coords.x / this.segmentWidthTiles);
        const sy = Math.floor(coords.y / this.segmentHeightTiles);
        const seg = this.segments.get(sx, sy);
        return seg;
    }
    move(collision: WorldCollision){
        const {aabb, velocity} = collision;
        let minX = -Infinity;
        let maxX = Infinity;
        let minY = -Infinity;
        let maxY = Infinity;
        if(collision.velocity.x < 0){
            // get min x position
            let cx = Math.floor(aabb.position.x / this.tileWidth) - 1;
            for(let y = aabb.position.y; y < aabb.position.y + collision.aabb.height; y+=this.tileHeight){
                let cy = Math.floor(y / this.tileHeight);
                if(this.collisionLookup.get(cx,cy) === 0){
                    minX = (cx+1)*this.tileWidth;
                }
            }
        }
        else if(collision.velocity.x > 0){
            // get max x position
            let cx = Math.floor((aabb.position.x + aabb.width) / this.tileWidth) + 1;
            for(let y = aabb.position.y; y < aabb.position.y + collision.aabb.height; y+=this.tileHeight){
                let cy = Math.floor(y / this.tileHeight);
                if(this.collisionLookup.get(cx,cy) === 0){
                    maxX = cx*this.tileWidth-aabb.width*1.01;
                }
            }
        }
        aabb.position.x += velocity.x;
        if(aabb.position.x < minX){
            aabb.position.x = minX; velocity.x = 0;
        }
        if(aabb.position.x > maxX){
            aabb.position.x = maxX; velocity.x = 0;
        }
        if(collision.velocity.y < 0){
            // get min y position
            let cy = Math.floor(aabb.position.y / this.tileHeight) - 1;
            for(let x = aabb.position.x; x < aabb.position.x + collision.aabb.height; x+=this.tileWidth){
                let cx = Math.floor(x / this.tileWidth);
                if(this.collisionLookup.get(cx,cy) === 0){
                    minY = (cy+1)*this.tileHeight;
                }
            }
        }
        else if(collision.velocity.y > 0){
            // get min y position
            let cy = Math.floor((aabb.position.y+aabb.height) / this.tileHeight) + 1;
            for(let x = aabb.position.x; x < aabb.position.x + collision.aabb.height; x+=this.tileWidth){
                let cx = Math.floor(x / this.tileWidth);
                if(this.collisionLookup.get(cx,cy) === 0){
                    maxY = cy*this.tileHeight - aabb.height * 1.01;
                }
            }
        }
        aabb.position.y += velocity.y;
        if(aabb.position.y < minY){
            aabb.position.y = minY; velocity.y = 0;
        }
        if(aabb.position.y > maxY){
            collision.grounded = true;
            aabb.position.y = maxY; velocity.y = 0;
        }
    }
}
