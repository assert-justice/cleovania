import { Engine, Graphics, Window } from "cleo";
import { Game } from "./game";
import { Globals } from "./globals";

Window.setStats('Cleovania', Globals.ViewWidth * 2, Globals.ViewHeight * 2);

Engine.init = ()=>{
    Globals.init();
    const framebuffer = Graphics.Texture.new(Globals.ViewWidth, Globals.ViewHeight);
    const game = new Game();
    Engine.update = (dt: number)=>{
        Globals.inputManager.poll();
        game.update(dt);
    }
    Engine.draw = ()=>{
        Graphics.pushRenderTarget(framebuffer);
        Graphics.clear();
        game.draw();
        Graphics.popRenderTarget();
        framebuffer.draw(0, 0, {width: Window.width, height: Window.height});
    }
}
