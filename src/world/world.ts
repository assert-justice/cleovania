import { Graphics, System } from "cleo";
import { HashGrid2D } from "../cleo/core/data";
// import { AnimatedSprite } from "../cleo/core/animated_sprite";
import { Globals } from "../globals";
import { Camera } from "../cleo/core/camera";
import { Vec2 } from "../cleo/core/la";
import { Player } from "../entities/player";
import { AABB } from "../cleo/core/aabb";
import { TileSprite } from "../cleo/core/tile_sprite";
// import { SpriteSheet } from "../cleo/core/sprite_sheet";

export class WorldCollision{
    x: number = 0;
    y: number = 0;
    w: number = 0;
    h: number = 0;
    dx: number = 0;
    dy: number = 0;
    // aabb: AABB;
    // velocity: Vec2;
    // collided: boolean = false;
    collidedLeft: boolean = false;
    collidedRight: boolean = false;
    collidedTop: boolean = false;
    collidedBottom: boolean = false;
    // constructor(aabb: AABB, velocity: Vec2){
    //     this.x = aabb.position.x; this.y = aabb.position.y;
    //     this.w = aabb.width; this.h = aabb.height;
    //     this.dx = velocity.x; this.dy = velocity.y;
    // }
}

export class Segment{
    world: World;
    coords: Vec2;
    position: Vec2;
    tiles: [number,number,number][];
    camWalls: Set<string>;
    tex?: Graphics.Texture;
    levelId: string;

    constructor(world: World, levelId: string, coords: Vec2, tiles: [number,number,number][], camWalls: Set<string>){
        this.world = world; this.levelId = levelId;
        this.coords = coords; this.tiles = tiles; this.camWalls = camWalls;
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
    entities = new HashGrid2D<String>("");
    tileTags = new Map<number, Set<string>>();
    tileset: TileSprite;
    camera: Camera;
    tileWidth: number;
    tileHeight: number;
    segmentWidthTiles: number;
    segmentHeightTiles: number;
    segmentWidthPixels;
    segmentHeightPixels;
    player: Player;
    constructor(tileWidth: number, tileHeight: number, segmentWidthTiles: number, segmentHeightTiles: number){
        this.tileWidth = tileWidth; this.tileHeight = tileHeight; 
        this.segmentWidthTiles = segmentWidthTiles;
        this.segmentHeightTiles = segmentHeightTiles;
        this.segmentWidthPixels = this.segmentWidthTiles*this.tileWidth;
        this.segmentHeightPixels = this.segmentHeightTiles*this.tileHeight;
        this.tileset = new TileSprite(Globals.textureManager.get("tiles"), this.tileWidth, this.tileHeight);
        this.camera = new Camera(this.segmentWidthPixels, this.segmentHeightPixels);
        this.camera.setPosition(new Vec2(this.segmentWidthPixels/2, this.segmentHeightPixels/2));
        this.player = new Player(this, this.camera);
        this.player.position.x = 100;
        this.player.position.y = 100;
    }
    draw(){
        this.camera.draw(0,this.tileHeight*2.5,()=>{
            for (const seg of this.segments.data.values()) {
                seg?.draw();
            }
            Globals.drawPools();
            this.player.draw();
        });
    }
    update(dt: number){
        if(!this.camera.isOob(this.camera.position)) {
            this.player.update(dt);
            Globals.updatePools(dt);
        }
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
    isCellSolid(cx: number, cy: number){
        return this.collisionLookup.get(cx,cy) === 0;
    }
    isPositionSolid(position: Vec2){
        const coord = this.getCoords(position);
        return this.isCellSolid(coord.x, coord.y);
    }
    private collideX(x: number, yStart: number, height: number): boolean{
        const yEnd = yStart + height;
        for(let y = yStart; y <= yEnd; y+=this.tileHeight){
            if(this.isPositionSolid(new Vec2(x, y))) return true;
        }
        return false;
    }
    private collideY(xStart: number, y: number, width: number): boolean{
        const xEnd = xStart + width;
        for(let x = xStart; x <= xEnd; x+=this.tileWidth){
            if(this.isPositionSolid(new Vec2(x, y))) return true;
        }
        return false;
    }
    move(x: number, y: number, w: number, h: number, dx: number, dy: number): WorldCollision{
        const col = new WorldCollision();
        if(dy < 0){
            if(this.collideY(x, y + dy, w - 5)){ // stupid bias that I hate
                col.collidedTop = true;
                System.println("top");
                dy = 0;
            }
            else{
                y += dy;
            }
        }
        else if(dy > 0){
            if(this.collideY(x, y + h + dy, w - 5)){
                col.collidedBottom = true;
                dy = 0;
            }
            else{
                y += dy;
            }
        }
        if(dx < 0){
            if(this.collideX(x + dx, y, h)){
                col.collidedLeft = true;
                dx = 0;
            }
            else{
                x += dx;
            }
        }
        else if(dx > 0){
            if(this.collideX(x + w + dy, y, h)){
                col.collidedRight = true;
                dx = 0;
            }
            else{
                x += dx;
            }
        }
        return {...col, x, y, w, h, dx, dy};
    }
    mount(){
        // set player position
        const spawner = [...this.entities.data.entries()].find(([_,v])=>v === "PlayerSpawner");
        if(spawner === undefined) throw "No player spawner found";
        const [key] = spawner;
        const [cx,cy] = this.entities.toCoord(key);
        this.player.position.x = cx * this.tileWidth;
        this.player.position.y = cy * this.tileHeight;
    }
}
