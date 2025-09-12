import type { BrowserEnv, Karlib } from "@goldenratio/karlib";
import { ScaleMode, Texture } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

interface BitmapTextOptions {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly color?: string;
  readonly alpha?: number;
}

export class BitmapText {
  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
  ) {
    // empty
  }

  draw_text(text: string, options: BitmapTextOptions): void {
    const t = this;
    const { scale = 1, alpha = 1 } = options;
    let tx = options.x;
    const letter_space = 2;

    for (let i = 0; i < text.length; i++) {
      let glyph_width = 16;
      const chr = text.charCodeAt(i);
      if (chr === 32) {
        tx += (10 * scale);
        continue;
      }
      const is_alpha = chr >= 97;
      const source_x = is_alpha ? 12 * (chr - 97) : 12 * (chr - 44);
      const source_y = is_alpha ? glyph_width * 2 : glyph_width / 2;
      t.kl.draw_texture({
        texture: t.res.font_texture,
        x: tx,
        y: options.y,
        width: (glyph_width * scale),
        height: glyph_width * scale,
        tint_color: options.color,
        alpha: alpha,
        source_rect: {
          x: source_x,
          y: source_y,
          width: 11,
          height: 16,
        }
      });
      if (chr === 46) {
        glyph_width = 8;
      }
      tx += (glyph_width + letter_space) * scale;
    }
  }
}

export interface BigTextOptions {
  readonly text: string;
  readonly font: string;
  readonly width: number;
  readonly height: number;
  readonly fontHeight: number;
  readonly depth: number,
  readonly colors: [[number, number, number], [number, number, number]];
  readonly threshold?: number;
}

export function create_big_text_texture(options: BigTextOptions, env: BrowserEnv): Texture {
  const { text, font, width, height, fontHeight, depth, colors, threshold = 127 } = options;

  const canvas = env.create_canvas(width, height);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.imageSmoothingEnabled = false;

    const lines: string[] = text.split("\n");

    for (let y = depth - 1; y >= 0; --y) {

      ctx.fillStyle = y == 0 ? "#ffffff" : "#000000";

      let line: number = 0;
      for (let l of lines) {
        ctx.fillText(l, width / 2, y + (line + 1) * fontHeight);
        ++line;
      }
    }

    const image_data: ImageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < width * height; ++i) {
      if (image_data.data[i * 4 + 3] < threshold) {
        image_data.data[i * 4 + 3] = 0;
        continue;
      }

      const colorIndex: number = image_data.data[i * 4] > 128 ? 0 : 1;
      for (let j = 0; j < 3; ++j) {
        image_data.data[i * 4 + j] = colors[colorIndex][j];
      }
      image_data.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(image_data, 0, 0);

  }
  const canvas_image_data = env.create_image_from_canvas(canvas);
  return new Texture(canvas_image_data, width, height, ScaleMode.Nearest);
}
