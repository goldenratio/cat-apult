import type { Karlib, Mutable, Rectangle } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

export const enum BuggerType {
  Default = 1,
  CircleSpin,
}

export class Bugger {
  x: number;
  y: number;
  width: number;
  height: number;
  hit_rect: Mutable<Rectangle>;
  type: BuggerType;

  angle: number = 0;
  initial_x: number = 0;
  initial_y: number = 0;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    type: BuggerType,
    x: number,
    y: number,
    angle: number = 0,
  ) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.hit_rect = {
      x: x - 12,
      y: y - 12,
      width: 24,
      height: 24,
    };
    this.type = type;
    this.initial_x = x;
    this.initial_y = y;
    this.angle = angle;
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    const t = this;
    if (t.type === BuggerType.CircleSpin) {
      const radius = 50;
      t.angle += 0.05 * dt;

      // Use sine and cosine to calculate the new coordinates
      t.x = (t.initial_x + Math.cos(t.angle) * radius) | 0;
      t.y = (t.initial_y + Math.sin(t.angle) * radius) | 0;

      // You should also update the hit rectangle to match the new position
      t.update_hit_rect();
    }
  }

  draw(): void {
    const t = this;

    if (t.type === BuggerType.CircleSpin) {
      t.kl.draw_texture({
        texture: t.res.orb_collected_texture,
        pivot: { x: 0.5, y: 0.5 },
        alpha: 0.9,
        x: t.initial_x,
        y: t.initial_y,
      });
      t.kl.draw_texture({
        texture: t.res.orb_collected_texture,
        pivot: { x: 0.5, y: 0.5 },
        scale: 0.8,
        alpha: 0.7,
        x: (t.initial_x + Math.cos(t.angle) * 20) | 0,
        y: (t.initial_y + Math.sin(t.angle) * 20) | 0,
      });
      t.kl.draw_texture({
        texture: t.res.orb_collected_texture,
        pivot: { x: 0.5, y: 0.5 },
        scale: 0.5,
        alpha: 0.5,
        x: (t.initial_x + Math.cos(t.angle) * 35) | 0,
        y: (t.initial_y + Math.sin(t.angle) * 35) | 0,
      });
    }

    t.kl.draw_texture({
      texture: t.res.bugger_texture,
      pivot: { x: 0.5, y: 0.5 },
      x: t.x,
      y: t.y,
    });
  }

  private update_hit_rect(): void {
    this.hit_rect.x = this.x - 12;
    this.hit_rect.y = this.y - 12;
  }
}
