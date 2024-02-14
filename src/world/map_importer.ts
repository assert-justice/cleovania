import { System } from "cleo";
import { HashGrid2D } from "../cleo/core/data";
import { Vec2 } from "../cleo/core/la";
import { Convert } from "./ldtk";
import { Segment, World } from "./world";

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
        const layer = layers[0];
        const segments = new HashGrid2D<Segment | undefined>(undefined);
        const roomXSegment = level.worldX / (world.tileWidth * world.segmentWidthTiles); 
        const roomYSegment = level.worldY / (world.tileHeight * world.segmentHeightTiles); 
        const roomWidthSegments = level.pxWid / (world.tileWidth * world.segmentWidthTiles); 
        const roomHeightSegments = level.pxHei / (world.tileHeight * world.segmentHeightTiles); 
        for (const tile of layer.gridTiles) {
            const tx = +tile.px[0] / layer.__gridSize + level.worldX/world.tileWidth;
            const ty = +tile.px[1] / layer.__gridSize + level.worldY/world.tileHeight;
            const idx = tile.t;
            // System.println(tx, ty, idx);
            const sx = Math.floor(tx / world.segmentWidthTiles);
            const sy = Math.floor(ty / world.segmentHeightTiles);
            let seg = segments.get(sx, sy);
            if(!seg) {
                seg = new Segment(world, new Vec2(sx, sy), [], new Set());
                segments.set(sx, sy, seg);
            }
            // seg.camWalls.add("t");
            // seg.camWalls.add("b");
            if(sx === roomXSegment) seg.camWalls.add("l");
            if(sx === roomXSegment + roomWidthSegments-1) seg.camWalls.add("r");
            if(sy === roomYSegment) seg.camWalls.add("t");
            if(sy === roomYSegment + roomHeightSegments-1) seg.camWalls.add("b");
            seg.tiles.push([tx,ty,idx]);
        }
        // System.println(segments.data.size)
        for (const [key, seg] of segments.data.entries()) {
            world.segments.data.set(key, seg);
            seg?.mount();
        }
    }
    return world;
}

// import { System } from "cleo";
// import { World } from "./world";

// export interface TilesetData{
//     name: string,
//     source: string,
//     tileWidth: number,
//     tileHeight: number,
//     tags: [number, string[]][],
// }

// export interface LayerData{
//     tilesetName: string,
//     tiles: [number, number, number][],
// }

// export interface SegmentData{
//     x: number,
//     y: number,
//     layer: LayerData,
//     // tilesetName: string,
//     // tiles: [number, number, number][],
// }

// export interface RoomData{
//     x: number,
//     y: number,
//     width: number,
//     height: number,
//     segments: SegmentData[],
// }

// export function parseLevel(src: string): World{
//     const data = JSON.parse(src);
//     const res = new World();
//     const tilesetCount: number = data.defs.tilesets.length;
//     for(let idx = 0; idx < tilesetCount; idx++){
//         const temp = data.defs.tilesets[idx];
//         const ts: TilesetData = {
//             name: temp.identifier,
//             source: temp.relPath,
//             tileWidth: temp.tileGridSize,
//             tileHeight: temp.tileGridSize,
//             tags: [],
//         }
//         res.addTileset(ts);
//     }
//     const levelCount = data.levels.length;
//     for(let idx = 0; idx < levelCount; idx++){
//         const level = data.levels[idx];
//     }
//     return res;
// }