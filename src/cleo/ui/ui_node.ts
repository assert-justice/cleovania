import { System } from "cleo";
import { UIStyle, UIStyleManager, getDefaultStyle } from "./ui_style";
import { Vec2 } from "../core/la";

interface Dimension{
    value: number,
    mode: 'px' | '%',
}

function dimensionDecode(dimension: string): [number, 'px' | '%']{
    const startDimension = dimension;
    dimension = dimension.trim();
    let mode: 'px' | '%' = 'px';
    if(dimension.endsWith('px')){
        mode = 'px';
        dimension = dimension.slice(0, dimension.length-2);
    }
    else if(dimension.endsWith('%')){
        mode = '%';
        dimension = dimension.slice(0, dimension.length-1);
    }
    const value = Number(dimension);
    if(Number.isNaN(value)){
        throw `Invalid dimension '${startDimension}'.`;
    }
    return [value, mode];
}

type PlaceFn = (lastVal: number, node: UINode)=>[number, number];
type ChildPos = [UINode, number, number];

export class UINode{
    private parent?: UINode = undefined;
    canFocus = false;
    private children: UINode[] = [];
    private childPositions: ChildPos[] = [];
    private dirty = true;
    _visible = true;
    get visible(){return this._visible;}
    set visible(val: boolean) {this._visible = val; this.setDirty();}
    private position: Vec2;
    // styleType: string;
    // styleId?: string;
    // styleClass?: string;
    // styleManager: UIStyleManager;
    style: UIStyle;
    // onMount: (node: UINode)=>void = ()=>{};
    // onUnmount: (node: UINode)=>void = ()=>{};
    onFocus: (node: UINode)=>void = ()=>{};
    onUnfocus: (node: UINode)=>void = ()=>{};
    onSelect: (node: UINode)=>void = ()=>{};
    onBack: (node: UINode)=>void = ()=>{};
    constructor(parent: UINode | undefined){
        this.style = getDefaultStyle();
        if(parent) {
            this.setParent(parent);
        }
        this.position = new Vec2();
    }
    onMount(){
        for (const child of this.children) {
            child.onMount();
        }
    }
    onUnmount(){
        for (const child of this.children) {
            child.onUnmount();
        }
    }
    setDirty(){
        this.dirty = true;
        if(this.parent) this.parent.setDirty();
    }
    getParent(){
        return this.parent;
    }
    setParent(parent?: UINode){
        if(parent === undefined) return;
        if(parent === this.parent) return;
        if(this.parent !== undefined) this.parent.removeChild(this);
        parent.addChild(this);
    }
    addChild(child: UINode){
        child.parent = this;
        this.children.push(child);
    }
    removeChild(child: UINode){
        this.children = this.children.filter(c => c !== child);
    }
    getChildren(){return [...this.children];}
    isOverNode(x: number, y: number){
        const minX = this.position.x - this.style.padLeft;
        const minY = this.position.y - this.style.padTop;
        const maxX = minX + this.getTotalWidth();
        const maxY = minY + this.getTotalHeight();
        return x > minX && x < maxX && y > minY && y < maxY; 
    }
    private getTotalWidth(){
        return this.style.width + this.style.padLeft + this.style.padRight;}
    private getTotalHeight(){return this.style.height + this.style.padTop + this.style.padBottom;}
    private getChildrenBounds(): [number, number]{
        let boundsWidth = 0; let boundsHeight = 0;
        if(this.style.flowDirection === 'vertical'){
            for (const child of this.children) {
                if(child.visible === false) continue;
                const w = child.getTotalWidth();
                const h = child.getTotalHeight();
                if(w > boundsWidth) boundsWidth = w;
                boundsHeight += h;
            }
        }
        else{ // flowDirection is horizontal
            for (const child of this.children) {
                if(child.visible === false) continue;
                const w = child.getTotalWidth();
                const h = child.getTotalHeight();
                boundsWidth += w;
                if(h > boundsHeight) boundsHeight = h;
            }
        }
        return [boundsWidth, boundsHeight];
    }
    private getAnchorCoords(xAlign: string, yAlign: string, boundsWidth: number, boundsHeight: number): [number, number]{
        let anchorX = 0; let anchorY = 0;
        if(xAlign === 'l'){
            anchorX += this.style.padLeft + this.style.marginLeft;
        }
        else if(xAlign === 'r'){
            anchorX += this.getTotalWidth() - boundsWidth - this.style.padRight - this.style.marginRight;
        }
        else{ // centered on x axis
            anchorX += (this.getTotalWidth() - boundsWidth) / 2;
        }
        if(yAlign === 't'){
            anchorY += this.style.padTop + this.style.marginTop;
        }
        else if(yAlign === 'b'){
            anchorY += this.getTotalHeight() - boundsHeight - this.style.padBottom - this.style.marginBottom;
        }
        else{ // centered on y axis
            anchorY = (this.getTotalHeight() - boundsHeight) / 2;
        }
        return [anchorX, anchorY];
    }
    fitChildren(){
        const [boundsWidth, boundsHeight] = this.getChildrenBounds();
        this.style.width = boundsWidth + this.style.marginLeft + this.style.marginRight;
        this.style.height = boundsHeight + this.style.marginTop + this.style.marginBottom;
        this.setDirty();
    }
    placeChildren(){
        this.childPositions.length = 0;
        if(this.children.length === 0) return;
        for (const child of this.children) {
            child.placeChildren();
        }
        let xPlaceFn: PlaceFn;// = (lastVal)=>lastVal;
        let yPlaceFn: PlaceFn;// = (lastVal)=>lastVal;
        let xAlign: 'l' | 'r' | '' = '';
        let yAlign: 't' | 'b' | '' = '';
        if(this.style.anchorMode.includes('l')) xAlign = 'l';
        else if(this.style.anchorMode.includes('r')) xAlign = 'r';
        if(this.style.anchorMode.includes('t')) yAlign = 't';
        else if(this.style.anchorMode.includes('b')) yAlign = 'b';
        const [boundsWidth, boundsHeight] = this.getChildrenBounds();
        const [xAnchor, yAnchor] = this.getAnchorCoords(xAlign, yAlign, boundsWidth, boundsHeight);
        if(this.style.flowDirection === 'vertical'){
            yPlaceFn = (lastVal, node) => [lastVal, lastVal + node.getTotalHeight()];
            if(xAlign === 'l') xPlaceFn = (lastVal)=>[lastVal, lastVal];
            else if(xAlign === 'r') 
                xPlaceFn = (lastVal, node)=>[lastVal + boundsWidth - node.getTotalWidth(), lastVal];
            else
                xPlaceFn = (lastVal, node)=>[lastVal + (boundsWidth - node.getTotalWidth()) / 2, lastVal];
        }
        else{
            xPlaceFn = (lastVal, node) => [lastVal, lastVal + node.getTotalWidth()];
            if(yAlign === 't') yPlaceFn = (lastVal)=>[lastVal, lastVal];
            else if(yAlign === 'b')
                yPlaceFn = (lastVal, node)=>[lastVal + boundsHeight - node.getTotalHeight(), lastVal];
            else
                yPlaceFn = (lastVal, node)=>[lastVal + (boundsHeight - node.getTotalHeight()), lastVal];
        }
        let cx = xAnchor; let cy = yAnchor;
        for (const child of this.children) {
            if(child.visible === false) continue;
            const [myX, myNextX] = xPlaceFn(cx, child);
            const [myY, myNextY] = yPlaceFn(cy, child);
            this.childPositions.push([child, myX, myY]);
            cx = myNextX; cy = myNextY;
        }
    }
    protected drawChildren(x: number, y: number){
        if(this.dirty){
            this.dirty = false;
            this.placeChildren();
        }
        for (const [child, dx, dy] of this.childPositions) {
            child.draw(x + dx, y + dy);
        }
    }
    draw(x: number, y: number){
        this.position.x = x; this.position.y = y;
        this.drawChildren(x, y);
    }
}