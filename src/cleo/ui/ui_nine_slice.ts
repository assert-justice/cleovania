import { Graphics } from "cleo";
import { UIImage } from "./ui_image";
import { UINode } from "./ui_node";

export class UINineSlice extends UIImage{
    innerX: number; 
    innerY: number; 
    innerWidth: number; 
    innerHeight: number;
    constructor(parent: UINode | undefined, texture: Graphics.Texture, innerX: number, innerY: number, innerWidth: number, innerHeight: number){
        super(parent, texture);
        this.innerX = innerX;
        this.innerY = innerY;
        this.innerWidth = innerWidth;
        this.innerHeight = innerHeight;
    }
    draw(x: number, y: number): void {
        const {width, height} = this.style;
        const wa = this.innerX; const wb = this.innerWidth; const wc = this.texture.width - wa - wb;
        const ha = this.innerY; const hb = this.innerHeight; const hc = this.texture.height - ha - hb;
        // corners
        this.texture.draw(x, y, {
            width: wa, height: ha,
            sw: wa, sh: ha,
        }); // tl
        this.texture.draw(x, y + height - hc, {
            width: wa, height: hc,
            sy: ha + hb,
            sw: wa, sh: hc,
        }); // bl
        this.texture.draw(x + width - wc, y + height - hc, {
            width: wc, height: hc,
            sx: wa + wb, sy: ha + hb,
            sw: wc, sh: hc,
        }); // br
        this.texture.draw(x + width - wc, y, {
            width: wc, height: ha,
            sx: wa + wb,
            sw: wc, sh: ha,
        }); // tr
        // edges
        this.texture.draw(x, y + ha, {
            width: wa, height: height - ha - hc,
            sy: ha,
            sw: wa, sh: hb,
        }); // l
        this.texture.draw(x + ha, y + height - ha, {
            width: width - wa - wc, height: hc,
            sx: wa, sy: ha + hb,
            sw: wb, sh: hc,
        }); // b
        this.texture.draw(x + width - wc, y + ha, {
            width: wc, height: height - ha - hc,
            sy: ha,
            sw: wc, sh: hb,
        }); // r
        this.texture.draw(x + wa, y, {
            width: width - wa - wc, height: ha,
            sx: wa,
            sw: wb, sh: ha,
        }); // t
        this.texture.draw(x + wa, y + ha, {
            width: width - wa - wc, height: height - ha - hc,
            sx: wa, sy: ha,
            sw: wb, sh: hb,
        }); // c
        this.drawChildren(x, y);
    }
}