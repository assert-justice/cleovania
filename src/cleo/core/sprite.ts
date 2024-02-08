import { Graphics } from "cleo";

export class Sprite{
    private texture: Graphics.Texture;
    properties: Graphics.TextureParams;
    constructor(texture: Graphics.Texture, props: Graphics.TextureParams | null = null){
        this.texture = texture;
        this.properties = props ?? {};
    }
    draw(x: number, y: number){
        this.texture.draw(x, y, this.properties);
    }
    setProps(props: Graphics.TextureParams){
        Object.assign(this.properties, props);
    }
}