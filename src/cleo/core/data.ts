// Assorted useful data structures

export class HashGrid2D<T> {
    data: Map<string,T>;
    startValue: T;
    separator = ':';

    toCoord(key: string): [number,number]{
        const [x,y] = key.split(this.separator).map(Number);
        return [x,y];
    }

    toKey(x: number, y: number): string{
        return [x, this.separator, y].join('');
    }

    set(x: number, y: number, val: T){
        this.data.set(this.toKey(x, y), val);
    }

    get(x: number, y: number): T{
        const val = this.data.get(this.toKey(x, y));
        if(val === undefined) return this.startValue;
        return val;
    }

    setArea(ax: number, ay: number, bx: number, by: number, val: T){
        if(ax > bx) [ax, bx] = [bx, ax];
        if(ay > by) [ay, by] = [by, ay];
        for(let x = ax; x <= bx; x++){
            for(let y = ay; y <= by; y++){
                this.set(x, y, val);
            }
        }
    }

    getExtents(): [number, number, number, number]{
        let [xMin, xMax, yMin, yMax] = [Infinity, -Infinity, Infinity, -Infinity];
        for (const key of this.data.keys()) {
            
            const [cx,cy] = this.toCoord(key);
            xMin = Math.min(xMin, cx);
            xMax = Math.max(xMax, cx);
            yMin = Math.min(yMin, cy);
            yMax = Math.max(yMax, cy);
        }
        return [xMin, xMax, yMin, yMax];
    }

    toString(xMin: number, xMax: number, yMin: number, yMax: number, fn: (a:T)=>string){
        const lines: string[] = [];
        for(let y = yMin; y <= yMax; y++){
            const line: string[] = [];
            for(let x = xMin; x <= xMax; x++){
                const val = this.get(x, y);
                
                line.push(fn(val));
            }
            lines.push(line.join(''));
            
        }    
        return lines.join('\n');
    }

    constructor(startValue: T){
        this.data = new Map();
        this.startValue = startValue;
    }
}

export class Grid<T> {
    data: T[];
    width: number;
    height: number;
    constructor(width: number, height: number, startValue: T){
        this.data = new Array<T>(width * height).fill(startValue).map(_=>startValue);
        this.width = width; this.height = height;

    }
    getIdx(x: number, y: number): number{
        if(!this.onGrid(x, y)) throw `Attempted to access invalid coordinate (${x},${y})`;
        return y*this.width+x;
    }
    get(x: number, y: number): T{
        return this.data[this.getIdx(x,y)];
    }
    set(x: number, y: number, val: T): void{
        this.data[this.getIdx(x,y)] = val;
    }
    onGrid(x: number, y: number):boolean{
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    setLine(ax: number, ay: number, bx: number, by: number, val: T){
        
        let [cx, cy] = [ax, ay];
        const dx = ax === bx ? 0 : (bx - ax) / Math.abs(bx - ax);
        const dy = ay === by ? 0 : (by - ay) / Math.abs(by - ay);
        
        this.set(cx, cy, val);
        
        while(cx !== bx || cy !== by){
            [cx, cy] = [cx + dx, cy + dy];
            this.set(cx, cy, val);
        }
    }
}

export class DefaultMap<T,R> extends Map{
    defaultValue: R;
    public constructor(defaultValue: R){
        super();
        this.defaultValue = defaultValue;
    }
    get(key: T): R{
        return super.get(key) || this.defaultValue;
    }
}