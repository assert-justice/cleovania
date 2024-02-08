import { Graphics, System } from "cleo";
import { UIImage } from "./ui_image";
import { UINode } from "./ui_node";

export class UIImageColor extends UIImage{
    constructor(parent: UINode | undefined, red: number, green: number, blue: number, alpha: number){
        // creates a tiny texture for itself
        super(parent, Graphics.Texture.fromColor(1, 1, red, green, blue, alpha));
    }
}