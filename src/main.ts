import { BrowserEnv, Karlib, BrowserTicker } from "@goldenratio/karlib";
import { Game } from "./game.js";
import { CanvasInteraction } from "./canvas_interaction.js";
import { VirtualJoyStick } from "./joystick.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

async function main(): Promise<void> {
  const d = document;
  const canvas = d.createElement("canvas");
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  Object.assign(canvas.style, <CSSStyleDeclaration>{
    // Style for centering
    display: "block",
    margin: "auto",
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    maxWidth: "100%",
    maxHeight: "100%",
    // pixel art
    imageRendering: "pixelated",
    // disable system UI and hijack scroll
    touchAction: "none",
    userSelect: "none",
  });


  Object.assign(d.body.style, <CSSStyleDeclaration>{
    // backgroundColor: "#1a1a1a",
    backgroundColor: "#977575",
    margin: "0",
    height: "100vh",
    overflow: "hidden",
  });

  d.body.appendChild(canvas);

  const is_touch = "ontouchstart" in window;

  let joystick: VirtualJoyStick | undefined = undefined;

  if (is_touch) {
    joystick = new VirtualJoyStick();
  }

  function resizeCanvas(): void {
    const { innerWidth, innerHeight } = window;

    if (innerWidth < GAME_WIDTH || innerHeight < GAME_HEIGHT) {
      // Scale proportionally to fit window
      const scale = Math.min(innerWidth / GAME_WIDTH, innerHeight / GAME_HEIGHT);
      canvas.style.width = `${(GAME_WIDTH * scale) | 0}px`;
      canvas.style.height = `${(GAME_HEIGHT * scale) | 0}px`;
    } else {
      // Default size
      canvas.style.width = "800px";
      canvas.style.height = "600px";
    }
    joystick?.on_resize(innerWidth, innerHeight);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const kl = new Karlib({
    canvas,
    env: new BrowserEnv(),
    pixel_perfect: true,
  });

  const game = new Game(
    kl,
    new CanvasInteraction({ source: canvas, joystick }),
  );
  await game.load_assets();
  game.init();

  let fps_update_freq = 0;
  let fps = 60;

  const ticker = new BrowserTicker();
  ticker.on_tick((delta_time) => {
    game.update(delta_time);
    game.draw();

    // display fps
    if (!process.env.PROD) {
      fps_update_freq++;
      if (fps_update_freq >= 60) {
        fps = ticker.get_fps();
        fps_update_freq = 0;
      }
      game.draw_fps(fps);
    }
  });
}

window.onload = () => main();
