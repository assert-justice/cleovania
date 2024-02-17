import { InputManager, VAxis2D, VButton } from "../cleo/core/input_manager";
import { SpriteSheet } from "../cleo/core/sprite_sheet";
import { Globals } from "../globals";
import { Actor } from "./actor";
import { World } from "../world/world";
import { Camera } from "../cleo/core/camera";

export class Player extends Actor{
    jump = false;
    speed = 300;
    gravity = 900;
    jumpGravity = 0.5;
    jumpPower = 400;
    inputManager: InputManager;
    spr: SpriteSheet;
    moveInput: VAxis2D;
    jumpInput: VButton;
    jumpBuffer = 0.3;
    jumpClock = 0;
    coyoteBuffer = 0.3;
    coyoteClock = 0;
    camera: Camera;
    constructor(world: World, camera: Camera){
        super(world, 24, 24);
        this.inputManager = Globals.inputManager;
        this.spr = new SpriteSheet(Globals.textureManager.get("characters"), 24, 24);
        this.moveInput = this.inputManager.getAxis2D("move");
        this.jumpInput = this.inputManager.getButton("jump");
        this.camera = camera;
    }
    update(dt: number): void {
        if(this.jumpClock > 0) this.jumpClock -= dt;
        if(this.coyoteClock > 0) this.coyoteClock -= dt;
        if(this.jumpInput.isPressed()) this.jumpClock = this.jumpBuffer;
        if(this.grounded) this.coyoteClock = this.coyoteBuffer;
        const move = this.moveInput.getValue();
        this.velocity.x = move.x * this.speed;
        // this.velocity.y = move.y * this.speed;
        if(this.jumpClock > 0 && this.coyoteClock > 0) {
            this.velocity.y = -this.jumpPower;
            this.jumpClock = 0;
            this.coyoteClock = 0;
        }
        this.acceleration.y = this.gravity;
        if(this.jumpInput.isDown()) this.acceleration.y *= this.jumpGravity;
        super.update(dt);
        // camera controls
        const cameraPos = this.camera.position.copy();
        cameraPos.x = this.position.x;
        cameraPos.y = this.position.y;
        // if(this.grounded) cameraPos.y = this.position.y;
        // else if(Math.abs(cameraPos.y - this.position.y) > 100) cameraPos.y = this.position.y;
        // else if(cameraPos.y-100> this.position.y) cameraPos.y = this.position.y;
        this.camera.setTargetPosition(cameraPos);
    }
    draw(): void {
        this.spr.draw(this.position.x, this.position.y);
    }
};
