import { Graphics } from "cleo";

export class TextureManager{
    private data: Map<string, Graphics.Texture>;
    constructor(){
        this.data = new Map();
    }
    add(name: string, path: string){
        const tex = Graphics.Texture.fromFile(path);
        this.data.set(name, tex);
        return this;
    }
    get(name: string): Graphics.Texture{
        const tex = this.data.get(name);
        if(tex === undefined) throw `No such texture '${name}'!`;
        return tex;
    }
}