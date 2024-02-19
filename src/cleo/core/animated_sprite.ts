import { Graphics } from "cleo";
import { Sprite } from "./sprite";
import { SpriteSheet } from "./sprite_sheet";
import { mod } from "./math";

export class SpriteAnimation{
    name = "default";
    framerate = 5;
    mode: "once" | "loop" | "bounce" = "once";
    frames: number[] = [];
    constructor(frameCount: number = 0){
        for(let idx = 0; idx < frameCount; idx++) this.frames.push(idx);
    }
    getFrame(idx: number){
        if(this.frames.length === 0) return 0;
        return this.frames[mod(idx, this.frames.length)];
    }
}

export class AnimatedSprite extends Sprite{
    private _frame = 0;
    get frame(){return this._frame;}
    set frame(v: number){
        this._frame = v;
        this.frameIdx = this.currentAnimation.getFrame(v);
        this.frameProgress = 0;
        // const cx = this.frameIdx % this.sheet.hCells;
        // const cy = Math.trunc(this.frameIdx / this.sheet.hCells);
        // this.setProps({
        //     sx: cx*this.sheet.frameWidth, 
        //     sy: cy*this.sheet.frameHeight,
        // });
        this.setProps(this.sheet.getSpriteProps(this.frameIdx, this.properties));
        // seems silly but needed to maintain flip state
        this.flipH = this.flipH;
        this.flipV = this.flipV;

    }
    private _isReversed = false;
    get isReversed(){return this._isReversed;}
    set isReversed(v: boolean){
        if(v === this._isReversed) return;
        this._isReversed = v;
        this.frameDirection = -this.frameDirection;
    }
    onAnimationEnd: ()=>void = ()=>{};
    private _isPlaying = false;
    private sheet: SpriteSheet;
    private frameIdx = 0;
    private frameDirection = 1;
    private frameProgress = 0;
    private animations = new Map<string, SpriteAnimation>();
    private currentAnimation = new SpriteAnimation();
    constructor(spriteSheet: SpriteSheet){
        super(spriteSheet.tex, {
            width: spriteSheet.frameWidth, 
            height: spriteSheet.frameHeight, 
            sw: spriteSheet.frameWidth, 
            sh: spriteSheet.frameHeight
        });
        this.sheet = spriteSheet;
    }
    addAnimation(animation: SpriteAnimation){
        this.animations.set(animation.name, animation);
    }
    setAnimation(name: string){
        const anim = this.animations.get(name);
        if(!anim) throw `No animation of name '${name}' is defined!`;
        this.currentAnimation = anim;
        this.reset();
    }
    play(){
        this.reset();
        this._isPlaying = true;
        this.frame = this._isReversed ? this.currentAnimation.frames.length-1 : 0;
    }
    pause(){this._isPlaying = false;}
    resume(){this._isPlaying = true;}
    isPlaying(){return this._isPlaying;}
    stop(){
        this._isPlaying = false;
        this.reset();
        this.onAnimationEnd();
    }
    update(dt: number){
        if(!this._isPlaying) return;
        this.frameProgress += dt;
        if(this.frameProgress < 1) return;
        this.frameProgress -= 1;
        this.frame += this.frameDirection;
        if(this.frame < 0 || this.frame >= this.currentAnimation.frames.length){
            switch (this.currentAnimation.mode) {
                case "once":
                    this.stop();
                    break;
                case "loop":
                    this.play();
                    break;
                case "bounce":
                    this.frameDirection = -this.frameDirection;
                    this.frame += this.frameDirection;
                    break;
                default:
                    break;
            }
        }
    }
    private reset(){
        this.frameDirection = 1;
        this.frame = 0;
    }
}

// export class AnimatedSprite extends Sprite{
//     idx: number = 0;
//     private width: number;
//     private height: number;
//     tileWidth: number;
//     tileHeight: number;
//     constructor(tex: Graphics.Texture, tileWidth: number, tileHeight: number){
//         super(tex, {width: tileWidth, height: tileHeight, sw: tileWidth, sh: tileHeight});
//         this.tileWidth = tileWidth;
//         this.tileHeight = tileHeight;
//         this.width = Math.trunc(tex.width / tileWidth);
//         this.height = Math.trunc(tex.height / tileHeight);
//     }
//     setTile(idx: number){
//         this.idx = idx;
//         if(idx < 0 || idx >= this.width*this.height) throw 'Sprite index out of bounds!';
//         const cx = idx % this.width;
//         const cy = Math.trunc(idx / this.width);
//         this.setProps({
//             sx: cx*this.tileWidth, 
//             sy: cy*this.tileHeight,
//         });
//         // seems silly but needed to maintain flip state
//         this.flipH = this.flipH;
//         this.flipV = this.flipV;
//     }
// }