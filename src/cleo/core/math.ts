export function clamp(value: number, min: number, max: number){
    return Math.min(max,Math.max(min, value));
}

export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}