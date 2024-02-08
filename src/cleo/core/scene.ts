import { App } from "./app";

export abstract class Scene{
    abstract update(dt: number): void;
    abstract draw(): void;
    finish(){}
}
