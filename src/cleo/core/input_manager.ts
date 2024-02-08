import { Input } from "cleo";
import { Vec2 } from "./la";

export const Key = {
    right: 262,
    left: 263,
    down: 264,
    up: 265,
    w:87,
    a:65,
    s:83,
    d:68,
    space:32,
    tab: 258,
    e: 69,
    page_up: 266,
    page_down: 267,
    enter: 257,
    escape: 256,
    0: 49,
    1: 50,
}

export const JoyButton = {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    lb: 4,
    rb: 5,
    back: 6,
    start: 7,
    guide: 8,
    ls: 9,
    rs: 10,
    d_up: 11,
    d_right: 12,
    d_down: 13,
    d_left: 14,
};

export const JoyAxis = {
    lx: 0,
    ly: 1,
    rx: 2,
    ry: 3,
    lt: 4,
    rt: 5,
};

export class VButton{
    private state: boolean = false;
    private lastState: boolean = false;
    private inputs: (()=>boolean)[];
    constructor(){
        this.inputs = [];
    }
    _poll(){
        this.lastState = this.state;
        this.state = this.inputs.some(inp=>inp());
    }
    isDown(): boolean{
        return this.state;
    }
    isPressed(): boolean{
        return this.state && !this.lastState;
    }
    isReleased(): boolean{
        return !this.state && this.lastState;
    }
    addInput(inp: ()=>boolean){
        this.inputs.push(inp);
        return this;
    }
    addKey(code: number){
        this.addInput(()=>Input.keyIsDown(code));
        return this;
    }
    addJoyButton(joyIdx: number, code: number){
        this.addInput(()=>Input.joyButtonIsDown(joyIdx, code));
        return this;
    }
    addMouseButton(code: number){
        this.addInput(()=>Input.mouseButtonIsDown(code));
        return this;
    }
}

export class VAxis{
    private value: number = 0;
    private inputs: (()=>number)[];
    constructor(){
        this.inputs = [];
    }
    _poll(){
        let min = 0; 
        let max = 0;
        for (const inp of this.inputs) {
            const val = inp();
            if(val > max) max = val;
            if(val < min) min = val;
        }
        this.value = max + min;
    }
    addInput(inp:()=>number){
        this.inputs.push(inp);
        return this;
    }
    addKeyPositive(code: number){
        this.inputs.push(()=>Input.keyIsDown(code) ? 1 : 0);
        return this;
    }
    addKeyNegative(code: number){
        this.inputs.push(()=>Input.keyIsDown(code) ? -1 : 0);
        return this;
    }
    addJoyButtonPositive(joyIdx: number, code: number){
        this.inputs.push(()=>Input.joyButtonIsDown(joyIdx, code) ? 1 : 0);
        return this;
    }
    addJoyButtonNegative(joyIdx: number, code: number){
        this.inputs.push(()=>Input.joyButtonIsDown(joyIdx, code) ? -1 : 0);
        return this;
    }
    addJoyAxis(joyIdx: number, code: number){
        this.inputs.push(()=>Input.joyGetAxis(joyIdx, code));
        return this;
    }
    getValue(){
        return this.value;
    }
}

export class VAxis2D{
    private _xAxis: VAxis;
    private _yAxis: VAxis;
    private value: Vec2;
    deadzone: number = 0.3;
    constructor(){
        this._xAxis = new VAxis();
        this._yAxis = new VAxis();
        this.value = new Vec2();
    }
    get xAxis(){
        return this._xAxis;
    }
    get yAxis(){
        return this._yAxis;
    }
    _poll(){
        this._xAxis._poll();
        this._yAxis._poll();
        this.value.x = this._xAxis.getValue();
        this.value.y = this._yAxis.getValue();
        const len = this.value.length();
        if(len > 1) {
            this.value.normalize();
            return;
        }
        if(len < this.deadzone){
            this.value.x = 0;
            this.value.y = 0;
            return;
        }
        // smooth deadzone calculation
        const trueLen = (len - this.deadzone) / (1 - this.deadzone);
        this.value.normalize().mul(trueLen);
    }
    getValue(): Vec2{
        return this.value;
    }
}

export class InputManager{
    buttons: Map<string, VButton>;
    axes: Map<string,VAxis>;
    axes2D: Map<string,VAxis2D>;
    cursorFn: ()=>[number, number];
    lastCursor: Vec2;
    cursorPosition: Vec2;
    cursorChanged = false;
    constructor(){
        this.buttons = new Map();
        this.axes = new Map();
        this.axes2D = new Map();
        // default ui controls
        this.addButton('uiUp').addJoyButton(0, JoyButton.d_up).addKey(Key.up).addKey(Key.w);
        this.addButton('uiDown').addJoyButton(0, JoyButton.d_down).addKey(Key.down).addKey(Key.s);
        this.addButton('uiLeft').addJoyButton(0, JoyButton.d_left).addKey(Key.left).addKey(Key.a);
        this.addButton('uiRight').addJoyButton(0, JoyButton.d_right).addKey(Key.right).addKey(Key.d);
        this.addButton('uiSelect')
            .addJoyButton(0, JoyButton.a)
            .addKey(Key.space)
            .addKey(Key.enter)
            .addMouseButton(0);
        this.addButton('uiBack').addJoyButton(0, JoyButton.b).addKey(Key.escape);
        this.cursorFn = ()=>[Input.mouseX, Input.mouseY];
        this.lastCursor = new Vec2();
        this.cursorPosition = new Vec2();
    }
    poll(){
        for (const button of this.buttons.values()) {
            button._poll();
        }
        for (const axis of this.axes.values()) {
            axis._poll();
        }
        for (const axis2D of this.axes2D.values()) {
            axis2D._poll();
        }
        const [cx, cy] = this.cursorFn();
        this.cursorPosition = new Vec2(cx, cy);
        this.cursorChanged = this.cursorPosition.x !== this.lastCursor.x || this.cursorPosition.y !== this.lastCursor.y;
        this.lastCursor = this.cursorPosition;
    }
    addButton(name: string){
        const button = new VButton();
        this.buttons.set(name, button);
        return button;
    }
    getButton(name: string){
        const button = this.buttons.get(name);
        if(button === undefined) throw `No button of name '${name}' exists!`;
        return button;
    }
    addAxis(name: string){
        const axis = new VAxis();
        this.axes.set(name, axis);
        return axis;
    }
    getAxis(name: string){
        const axis = this.axes.get(name);
        if(axis === undefined) throw `No axis of name '${name}' exists!`;
        return axis;
    }
    addAxis2D(name: string){
        const axis2D = new VAxis2D();
        this.axes2D.set(name, axis2D);
        return axis2D;
    }
    getAxis2D(name: string){
        const axis2D = this.axes2D.get(name);
        if(axis2D === undefined) throw `No axis2D of name '${name}' exists!`;
        return axis2D;
    }
}