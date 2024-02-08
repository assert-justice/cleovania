import { Scene } from "./scene";

export class App{
    scene?: Scene;
    sceneStore: Map<string, ()=>Scene>;
    constructor(){
        this.sceneStore = new Map();
    }
    setScene(name: string){
        const nextScene = this.sceneStore.get(name);
        if(nextScene === undefined) throw `Unknown scene name '${name}'`;
        this.scene = nextScene();
    }
    update(dt: number){
        this.scene?.update(dt);
    }
    draw(){
        this.scene?.draw();
    }
}