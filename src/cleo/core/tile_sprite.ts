import { Graphics } from "cleo";
import { Sprite } from "./sprite";
import { SpriteSheet } from "./sprite_sheet";

export class TileSprite extends Sprite{
    sheet: SpriteSheet;
    constructor(tex: Graphics.Texture, frameWidth: number, frameHeight: number){
        const sheet = new SpriteSheet(tex, frameWidth, frameHeight);
        super(tex, sheet.getSpriteProps(0));
        this.sheet = sheet;
    }
    setTile(idx: number){
        if(idx < 0 || idx >= this.sheet.frameCount) throw `Invalid tile index '${idx}'`;
        this.properties = this.sheet.getSpriteProps(idx, this.properties);
    }
}