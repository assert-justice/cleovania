import { System } from "cleo";
import { HashGrid2D } from "../cleo/core/data";
import { Vec2 } from "../cleo/core/la";
import { Convert, LayerInstance, Level } from "./ldtk";
import { Segment, World } from "./world";

function addTileLayer(world: World, level: Level,  layer: LayerInstance){
    const segments = new HashGrid2D<Segment | undefined>(undefined);
    const roomXSegment = level.worldX / (world.tileWidth * world.segmentWidthTiles); 
    const roomYSegment = level.worldY / (world.tileHeight * world.segmentHeightTiles); 
    const roomWidthSegments = level.pxWid / (world.tileWidth * world.segmentWidthTiles); 
    const roomHeightSegments = level.pxHei / (world.tileHeight * world.segmentHeightTiles); 
    for (const tile of layer.gridTiles) {
        const tx = +tile.px[0] / layer.__gridSize + level.worldX/world.tileWidth;
        const ty = +tile.px[1] / layer.__gridSize + level.worldY/world.tileHeight;
        const idx = tile.t;
        const sx = Math.floor(tx / world.segmentWidthTiles);
        const sy = Math.floor(ty / world.segmentHeightTiles);
        let seg = segments.get(sx, sy);
        if(!seg) {
            seg = new Segment(world, level.identifier, new Vec2(sx, sy), [], new Set());
            segments.set(sx, sy, seg);
        }
        if(sx === roomXSegment) seg.camWalls.add("l");
        if(sx === roomXSegment + roomWidthSegments-1) seg.camWalls.add("r");
        if(sy === roomYSegment) seg.camWalls.add("t");
        if(sy === roomYSegment + roomHeightSegments-1) seg.camWalls.add("b");
        seg.tiles.push([tx,ty,idx]);
    }
    for (const [key, seg] of segments.data.entries()) {
        world.segments.data.set(key, seg);
        seg?.mount();
    }
}

function addEntityLayer(world: World, layer: LayerInstance){
    for (const ent of layer.entityInstances) {
        world.entities.set(ent.__grid[0], ent.__grid[1], ent.__identifier);
    }
}

export function parseLdtk(src: string): World{
    const data = Convert.toLdtk(src);
    const tileWidth = 16;
    const wgw = data.worldGridWidth;
    const wgh = data.worldGridHeight;
    if(!wgw || !wgh) throw 'nope';
    const world = new World(tileWidth, tileWidth, wgw/tileWidth, wgh/tileWidth);
    const ts = data.defs.tilesets[0];
    for (const tag of ts.enumTags) {
        for (const id of tag.tileIds) {
            let tt = world.tileTags.get(id);
            if(tt === undefined){
                tt = new Set();
                world.tileTags.set(id, tt);
            }
            tt.add(tag.enumValueId);
        }
    }
    for (const level of data.levels) {
        const layers = level.layerInstances;
        if(!layers) throw 'oops';
        // const layer = layers[0];
        for (const layer of layers) {
            if(layer.__type === "Tiles"){
                addTileLayer(world, level, layer);
            }
            else if(layer.__type === "Entities"){
                addEntityLayer(world, layer);
            }
        }
    }
    return world;
}
