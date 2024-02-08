import { Graphics, System } from "cleo";
import { SpriteSheet } from "../core/sprite_sheet";
import { Text } from "../core/text";
import { UINode } from "./ui_node";

export class UILabel extends UINode{
    get text(){return this.textComponent.text;}
    set text(str: string){this.textComponent.text = str}
    textComponent: Text;
    // charactersVisible: number = -1;
    constructor(parent: UINode | undefined, textRenderer: Text){
        super(parent);
        this.textComponent = textRenderer;
    }
    static fromTexture(parent: UINode | undefined, text: string, texture: Graphics.Texture, tileWidth: number, tileHeight: number){
        const sheet = new SpriteSheet(texture, tileWidth, tileHeight);
        const textRenderer = new Text(sheet, text);
        return new UILabel(parent, textRenderer);
    }
    fitText(){
        this.style.width = this.textComponent.width + this.style.marginLeft + this.style.marginRight; 
        this.style.height = this.textComponent.height + this.style.marginTop + this.style.marginBottom;
        this.setDirty();
    }
    draw(x: number, y: number): void {
        this.textComponent.draw(x + this.style.padLeft, y + this.style.padRight);
        super.draw(x, y);
    }
}