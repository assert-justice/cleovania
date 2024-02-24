import { Graphics, System } from "cleo";

export class Sprite{
    private texture: Graphics.Texture;
    properties: Graphics.TextureParams;
    private _flipH = false;
    set flipH(isFlipped: boolean){
        if(this._flipH === isFlipped) return;
        this._flipH = isFlipped;
        const sw = this.properties.sw??this.texture.width;
        const sx = this.properties.sx??0;
        // if val is not flipped and sw is negative unflip sprite
        this.properties.sw = -sw;
        this.properties.sx = sx + sw;
    }
    get flipH(){return this._flipH;}
    private _flipV = false;
    set flipV(isFlipped: boolean){
        if(this.flipV === isFlipped) return;
        this._flipV = isFlipped;
        const sh = this.properties.sh??this.texture.height;
        const sy = this.properties.sy??0;
        // if val is not flipped and sh is negative unflip sprite
        this.properties.sh = - sh;
        this.properties.sy = sy + sh;
    }
    get flipV(){return this._flipV;}
    constructor(texture: Graphics.Texture, props: Graphics.TextureParams | null = null){
        this.texture = texture;
        this.properties = props ?? {};
    }
    draw(x: number, y: number){
        this.texture.draw(x, y, this.properties);
    }
    setProps(props: Graphics.TextureParams){
        Object.assign(this.properties, props);
        // handle flipping
        const sw = this.properties.sw??this.texture.width;
        if((this.flipH && sw > 0) || (!this.flipH && sw < 0)){
            const sx = this.properties.sx??0;
            this.properties.sw = -sw;
            this.properties.sx = sx + sw;
        }
        const sh = this.properties.sh??this.texture.height;
        // const sy = this.properties.sy??0;
        if((this.flipV && sh > 0) || (!this.flipV && sh < 0)){
            const sy = this.properties.sy??0;
            this.properties.sh = -sh;
            this.properties.sy = sy + sh;
        }
    }
}