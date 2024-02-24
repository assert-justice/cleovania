import { InputManager, VAxis2D, VButton } from "../cleo/core/input_manager";
import { AnimatedSprite, SpriteAnimation } from "../cleo/core/animated_sprite";
import { Globals } from "../globals";
import { Actor } from "./actor";
import { World } from "../world/world";
import { Camera } from "../cleo/core/camera";
import { Pool } from "../cleo/core/pool";
import { Bullet } from "./bullet";
import { Vec2 } from "../cleo/core/la";
import { System } from "cleo";
import { SpriteSheet } from "../cleo/core/sprite_sheet";

export class Player extends Actor{
    jump = false;
    speed = 300;
    gravity = 900;
    jumpGravity = 0.5;
    jumpPower = 400;
    inputManager: InputManager;
    spr: AnimatedSprite;
    moveInput: VAxis2D;
    jumpInput: VButton;
    fireInput: VButton;
    jumpBuffer = 0.3;
    jumpClock = 0;
    coyoteBuffer = 0.3;
    coyoteClock = 0;
    camera: Camera;
    bulletPool: Pool;
    state: "idle" | "running" | "jumping" = "idle";
    constructor(world: World, camera: Camera){
        super(world, 50, 37);
        // this.aabb.offset = new Vec2(10, 0);
        this.inputManager = Globals.inputManager;
        this.bulletPool = Globals.playerBulletPool;
        const spriteSheet = new SpriteSheet(Globals.textureManager.get("adventurer"), 50, 37);
        this.spr = new AnimatedSprite(spriteSheet);
        let anim = new SpriteAnimation();
        anim.name = "idle";
        anim.mode = "loop";
        anim.frames = [0, 1, 2, 3];
        this.spr.addAnimation(anim);
        this.spr.setAnimation("idle");
        this.spr.play();
        this.moveInput = this.inputManager.getAxis2D("move");
        this.jumpInput = this.inputManager.getButton("jump");
        this.fireInput = this.inputManager.getButton("fire");
        this.camera = camera;
    }
    update(dt: number): void {
        this.spr.update(dt);
        if(this.jumpClock > 0) this.jumpClock -= dt;
        if(this.coyoteClock > 0) this.coyoteClock -= dt;
        if(this.jumpInput.isPressed()) this.jumpClock = this.jumpBuffer;
        if(this.grounded) this.coyoteClock = this.coyoteBuffer;
        const move = this.moveInput.getValue();
        if(move.x > 0) this.spr.flipH = false;
        else if(move.x < 0) this.spr.flipH = true;
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
        // if(this.grounded && Math.abs(this.velocity.y) > 0.01 && this.spr.getAnimation() !== "run"){
        //     this.spr.setAnimation("run");
        // }
        // camera controls
        const cameraPos = this.camera.position.copy();
        cameraPos.x = this.position.x;
        cameraPos.y = this.position.y;
        // if(this.grounded) cameraPos.y = this.position.y;
        // else if(Math.abs(cameraPos.y - this.position.y) > 100) cameraPos.y = this.position.y;
        // else if(cameraPos.y-100> this.position.y) cameraPos.y = this.position.y;
        this.camera.setTargetPosition(cameraPos);
        if(this.fireInput.isPressed()){
            const bullet = this.bulletPool.getNew() as Bullet;
            bullet.position = this.position.copy();
            bullet.velocity = new Vec2(this.spr.flipH ? 300 : -300, 0);
        }
    }
    draw(): void {
        this.spr.draw(this.position.x, this.position.y);
    }
};
