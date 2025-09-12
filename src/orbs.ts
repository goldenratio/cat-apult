import type { Karlib } from "@goldenratio/karlib";
import { Mutable, Rectangle } from "@goldenratio/karlib";
import { Resource } from "./resource.js";

export class Orb {
  x: number;
  y: number;
  hit_rect: Mutable<Rectangle>;

  is_collected: boolean = false;
  collected_scale_x: number = 0;
  collected_animation_complete: boolean = false;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    x: number,
    y: number,
  ) {
    this.x = x;
    this.y = y;
    this.hit_rect = {
      x: x + 3,
      y: y + 3,
      width: 10,
      height: 10,
    };
  }

  set_is_collected(value: boolean): void {
    this.is_collected = value;
  }

  dispose(): void {
    // empty
  }

  update(dt: number): void {
    const t = this;
    if (t.is_collected && !t.collected_animation_complete) {
      t.collected_scale_x += 0.8 * dt;
      if (t.collected_scale_x >= 5) {
        t.collected_animation_complete = true;
        t.collected_scale_x = 0;
      }
    }
  }

  draw(): void {
    const t = this;
    if (t.is_collected) {
      t.kl.draw_texture({
        texture: t.res.orb_collected_texture,
        x: t.x,
        y: t.y,
      });
      if (!t.collected_animation_complete) {
        t.kl.draw_texture({
          texture: t.res.orb_collected_texture,
          x: t.x + 8,
          y: t.y + 8,
          tint_alpha: 1,
          tint_color: "#fff",
          scale: { x: t.collected_scale_x, y: 0.5 },
          pivot: { x: 0.5, y: 0.5 }
        });
      }
    } else {
      t.kl.draw_texture({
        texture: t.res.orb_texture,
        x: t.x,
        y: t.y,
      });
    }
  }
}
