import type { Karlib, Mutable, Rectangle } from "@goldenratio/karlib";
import { Resource } from "./resource.js";

export const enum BlockType {
  Floor = 1,
  WallVertical,
  WallHorizontal,
  FallingFloor,
}

export class Block {
  x: number;
  y: number;
  width: number;
  height: number;
  hit_rect: Mutable<Rectangle>;
  type: BlockType;

  player_hit_once: boolean = false;
  alpha: number | undefined = undefined;

  is_active: boolean = true;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    type: BlockType,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // const hit_rect_height = type === BlockType.Floor ? height : height;
    this.hit_rect = {
      x: x,
      y: y,
      width: width,
      height: height,
    };
    if (type === BlockType.FallingFloor) {
      this.alpha = 1;
    }
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    const t = this;
    if (t.type === BlockType.FallingFloor) {
      if (t.player_hit_once && t.alpha > 0) {
        t.alpha -= 0.008 * dt;
        if (t.alpha < 0) {
          t.alpha = 0;
          t.perform_floor_fall();
        }
      }
    }
  }

  draw(): void {
    const t = this;
    t.kl.draw_texture({
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      texture: t.res.black_texture,
      alpha: t.alpha,
    });
  }

  player_hit_floor(): void {
    const t = this;
    t.player_hit_once = true;
  }

  private perform_floor_fall(): void {
    console.log("floor fall!");
    this.is_active = false;
    this.hit_rect.y -= 6;
  }
}
