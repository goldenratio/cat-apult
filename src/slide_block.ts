import type { Karlib, Mutable, Rectangle } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

export class SlideBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  end_x: number;
  hit_rect: Mutable<Rectangle>;

  start_x: number = 0;
  direction: number = 1;

  new_x: number = 0;
  is_moving: boolean = false;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    x: number,
    y: number,
    width: number,
    height: number,
    end_x: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.end_x = end_x;
    this.hit_rect = {
      x: x,
      y: y,
      width: width,
      height: height,
    };

    this.start_x = x;
    this.new_x = x;
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    const t = this;
    if (t.direction === 1 && t.x <= t.start_x) {
      t.is_moving = false;
      return;
    }
    if (t.direction === -1 && t.x >= t.end_x - t.width) {
      t.is_moving = false;
      return;
    }
    const move_speed = 10;
    const delta_x = t.new_x - t.x;

    const distance_to_go = delta_x < 0 ? ~delta_x + 1 : delta_x;
    const max_move = move_speed * dt;

    if (distance_to_go <= max_move) {
      t.x = t.new_x | 0;
    } else {
      const sign = delta_x > 0 ? 1 : -1;
      t.x += (sign * max_move) | 0;
    }

    t.is_moving = true;
    t.update_hit_rect();
  }

  draw(): void {
    const t = this;
    t.kl.draw_texture({
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      texture: t.res.black_texture,
      // alpha: 0.1,
    });

    t.kl.draw_texture({
      texture: t.res.orb_collected_texture,
      x: t.start_x - 16,
      y: t.y + (t.height >> 1) - 8,
    });

    t.kl.draw_texture({
      texture: t.res.orb_collected_texture,
      x: t.end_x,
      y: t.y + (t.height >> 1) - 8,
    });

    t.kl.draw_texture({
      texture: t.res.black_texture,
      x: t.start_x,
      y: t.y + (t.height >> 1) - 1,
      width: t.end_x - t.start_x,
      height: 2,
    });
  }

  toggle(): void {
    const t = this;
    t.direction *= -1;
    if (t.direction === 1) {
      t.new_x = t.start_x;
    } else {
      t.new_x = t.end_x - t.width;
    }
    t.update_hit_rect();
  }

  private update_hit_rect(): void {
    this.hit_rect.x = this.x;
    this.hit_rect.y = this.y;
  }
}
