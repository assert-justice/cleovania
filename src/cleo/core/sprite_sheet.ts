import { Graphics } from "cleo";

export class SpriteSheet{
    tex: Graphics.Texture;
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
    hCells: number;
    vCells: number;
    offsetX = 0;
    offsetY = 0;
    padLeft = 0;
    padRight = 0;
    padTop = 0;
    padBottom = 0;
    constructor(tex: Graphics.Texture, frameWidth: number, frameHeight: number){
        this.tex = tex; this.frameWidth = frameWidth; this.frameHeight = frameHeight;
        this.hCells = Math.floor(tex.width / frameWidth);
        this.vCells = Math.floor(tex.height / frameHeight);
        this.frameCount = this.hCells * this.vCells;
    }
    getSpriteProps(idx: number, props?: Graphics.TextureParams){
        if(!props) props = {};
        const cx = idx % this.hCells;
        const cy = Math.trunc(idx / this.hCells);
        props = { ...props,
            sx: cx*this.frameWidth, 
            sy: cy*this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight,
            sw: this.frameWidth,
            sh: this.frameHeight,
        };
        return props;
    }
}