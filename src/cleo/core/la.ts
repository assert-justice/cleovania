
export class Vec2{
    x = 0;
    y = 0;
    constructor(x = 0, y = 0){
        this.x = x; this.y = y;
    }
    length(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalizeMutate(){
        const len = this.length();
        if(len === 0) return this;
        this.x/=len; this.y/=len;
        return this;
    }
    normalize(){
        return this.copy().normalizeMutate();
    }
    mulMutate(scalar: number){
        this.x*=scalar; this.y*=scalar;
        return this;
    }
    mul(scalar: number){
        return this.copy().mulMutate(scalar);
    }
    addMutate(vec2: Vec2){
        this.x += vec2.x;
        this.y += vec2.y;
        return this;
    }
    add(vec2: Vec2){
        return this.copy().addMutate(vec2);
    }
    subMutate(vec2: Vec2){
        this.x -= vec2.x;
        this.y -= vec2.y;
        return this;
    }
    sub(vec2: Vec2){
        return this.copy().subMutate(vec2);
    }
    distance(vec2: Vec2){
        const x = this.x-vec2.x;
        const y = this.y-vec2.y;
        return Math.sqrt(x * x + y * y);
    }
    copy(){
        return new Vec2(this.x, this.y);
    }
    angle(): number{
        return Math.atan2(this.y, this.x);
    }
}