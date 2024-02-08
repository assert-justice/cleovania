import { UIImage } from "./ui_image"
import { UINode } from "./ui_node"

export interface UIStyle{
    width: number,
    height: number,
    padLeft: number,
    padRight: number,
    padTop: number,
    padBottom: number,
    marginLeft: number,
    marginRight: number,
    marginTop: number,
    marginBottom: number,
    // textAlign: 'left' | 'center' | 'right',
    flowDirection: 'horizontal' | 'vertical',
    anchorMode: 'tl' | 'l' | 'bl' | 'b' | 'br' | 'r' | 'tr' | 't' | 'c' ,
    // backgrounds: UIImage[],
    isMask: boolean,
}

export function getDefaultStyle(): UIStyle{
    return {
        width: 0,
        height: 0,
        padLeft: 0,
        padRight: 0,
        padTop: 0,
        padBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        // textAlign: 'left',
        flowDirection: 'vertical',
        anchorMode: 'tl',
        isMask: false,
        // backgrounds: [],
    }
}

export class UIStyleManager{
    defaultStyle = getDefaultStyle();
    constructor(){}
    match(node: UINode): UIStyle{
        return this.defaultStyle;
    }
}