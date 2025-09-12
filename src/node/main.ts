import * as sk from "skia-canvas"

import { DisposeBag, Karlib } from "@goldenratio/karlib";
import type { EnvProvider, FixedLenArray } from "@goldenratio/karlib";

import { Game } from "../game.js";
import { CanvasInteraction } from "../canvas_interaction.js";

function unsafeAssert<T>(value: unknown): T {
  return value as T;
}

class SkiaCanvasEnv implements EnvProvider {
  create_canvas(width: number, height: number): OffscreenCanvas {
    return unsafeAssert(new sk.Canvas(width, height));
  }

  create_image_from_canvas(canvas: sk.Canvas): ImageBitmap {
    const buffer = canvas.toBufferSync("png");
    return unsafeAssert(new sk.Image(buffer));
  }

  load_image(url: string): Promise<ImageBitmap | undefined> {
    return new Promise(async (resolve) => {
      try {
        const image = await sk.loadImage(url);
        resolve(unsafeAssert(image));
      } catch (err) {
        resolve(undefined);
      }
    });
  }

  create_dom_matrix(value?: FixedLenArray<number, 6> | FixedLenArray<number, 16>): DOMMatrix {
    const matrix = new sk.DOMMatrix(value);
    return unsafeAssert(matrix);
  }
}

class Ticker {
  private readonly disposeBag = new DisposeBag();

  // Target frames per millisecond
  private readonly target_fpms: number;
  private readonly max_elapsed_ms = 100;
  private readonly win: sk.Window;

  private speed: number = 1;
  private last_time: number = -1;
  private delta_time: number = 1;
  private elapsed_ms: number = 1;

  constructor(win: sk.Window, fps: number = 60) {
    this.win = win;
    this.target_fpms = fps / 1000;
    this.elapsed_ms = 1 / this.target_fpms;
  }

  on_tick(fn: (delta_time: number) => void): void {
    const update_loop = (current_time: number = performance.now()) => {
      let elapsed_ms: number;
      if (current_time > this.last_time) {
        elapsed_ms = current_time - this.last_time;
        this.elapsed_ms = elapsed_ms;
        if (elapsed_ms > this.max_elapsed_ms) {
          elapsed_ms = this.max_elapsed_ms;
        }
        this.delta_time = elapsed_ms * this.target_fpms * this.speed;
      } else {
        this.delta_time = 0;
      }
      this.last_time = current_time;

      fn(this.delta_time);
    };

    this.disposeBag.from_event(this.win, "frame", (event: sk.WindowEvents["frame"]) => {
      if (event.frame <= 2) {
        return;
      }
      update_loop();
    });
  }

  get_fps(): number {
    return (1000 / this.elapsed_ms) | 0;
  }

  dispose(): void {
    this.disposeBag.dispose();
  }
}

async function main(): Promise<void> {
  const canvas = new sk.Canvas(800, 600);
  const env = new SkiaCanvasEnv();

  const kl = new Karlib({
    canvas: unsafeAssert(canvas),
    env: env,
    pixel_perfect: true,
  });

  const game = new Game(kl);
  await game.load_assets();

  // await should happen before creating window
  const win = new sk.Window({
    title: "Cat-apult",
    canvas: canvas,
    fit: "contain",
    background: "#999999",
    // @ts-ignore
    resizable: false,
  });

  game.set_canvas_interaction(new CanvasInteraction({ source: win }));
  game.init();

  let fps_update_freq = 0;
  let fps = 60;

  const ticker = new Ticker(win);
  ticker.on_tick((delta_time) => {
    game.update(delta_time);
    game.draw();

    if (!process.env.PROD) {
      // display fps
      fps_update_freq++;
      if (fps_update_freq >= 60) {
        fps = ticker.get_fps();
        fps_update_freq = 0;
      }
      game.draw_fps(fps);
    }
  });
}

main();
