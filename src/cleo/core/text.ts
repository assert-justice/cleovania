import { AnimatedSprite } from "./animated_sprite";
import { TileSprite } from "./tile_sprite";

type WrapMode = 'none';
type Char = [number, number, number];

export class Text{
    private sheet: TileSprite;

    private _text: string;
    get text(){return this._text;}
    set text(str: string){this._text = str; this.calcCharacters();}

    private _width: number = 0;
    get width(){return this._width;}

    private _height: number = 0;
    get height(){return this._height;}

    private _wrapMode: WrapMode = 'none';
    get wrapMode(){return this._wrapMode;}
    set wrapMode(mode: WrapMode){this._wrapMode = mode; this.calcCharacters();}

    private characters: Char[];
    constructor(spriteSheet: TileSprite, text: string){
        this.sheet = spriteSheet;
        this._text = text;
        this.characters = [];
        this.text = text;
    }
    private calcCharacters(){
        this.characters.length = 0;
        let ox = 0; let oy = 0;
        let maxW = 0; let maxH = 0;
        for(let i = 0; i < this._text.length; i++){
            if(this._text[i] === '\n'){
                ox = 0; oy+=this.sheet.sheet.frameHeight;
            }
            if(ox + this.sheet.sheet.frameWidth > maxW) maxW = ox + this.sheet.sheet.frameWidth;
            if(oy + this.sheet.sheet.frameHeight > maxH) maxH = oy + this.sheet.sheet.frameHeight;
            const code = this._text.charCodeAt(i) - 32;
            if(code >= 0 && code < 105) this.characters.push([code, ox, oy]);
            ox += this.sheet.sheet.frameWidth;
        }
        this._width = maxW; this._height = maxH;
    }
    draw(x: number, y: number){
        for (const [code, ox, oy] of this.characters) {
            this.sheet.setTile(code);
            this.sheet.draw(x + ox, y + oy);
        }
    }
}