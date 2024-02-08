import { System } from "cleo";
import { UINode } from "./ui_node";

export class UIButton extends UINode{
    unfocused: UINode;
    focused: UINode;
    constructor(parent: UINode, unfocused: UINode, focused: UINode){
        super(parent);
        this.unfocused = unfocused;
        this.focused = focused;
        this.canFocus = true;
        this.onFocus = ()=>{
            this.removeChild(unfocused);
            this.addChild(focused);
        }
        this.onUnfocus = ()=>{
            this.removeChild(focused);
            this.addChild(unfocused);
        }
    }
    onMount(): void{
        this.removeChild(this.unfocused);
        this.removeChild(this.focused);
        this.addChild(this.unfocused);
        this.fitChildren();
        this.setDirty();
    }
    onUnmount(): void {
        this.removeChild(this.unfocused);
        this.removeChild(this.focused);
        this.setDirty();
    }
}