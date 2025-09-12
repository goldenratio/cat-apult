import { CanvasInteraction } from "./canvas_interaction.js";
import type { Mutable, Point, Karlib } from "@goldenratio/karlib";

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type ProjectileResult = { p0: Point, p1: Point, p2: Point, id: number };

const MIN_JUMP_HEIGHT = 30;
const ACTIVE_COLOR = "#000"; // e91e63
const INACTIVE_COLOR = "rgba(0, 0, 0, 0.2)"; // 510821

let id = 0;

export class HeroControls {
  private input?: Mutable<Point> = undefined;
  private start: Mutable<Point> = { x: 0, y: 0 };
  private end: Mutable<Point> = { x: 0, y: 0 };
  private line_dash_offset: number = 0;
  private height_diff: number = 0;

  enabled: boolean = false;
  result: ProjectileResult | undefined = undefined;

  constructor(
    private readonly kl: Karlib,
    private readonly ci: CanvasInteraction,
  ) {
    // empty
  }

  set_enabled(value: boolean): void {
    const t = this;
    if (t.enabled === value) {
      return;
    }
    t.enabled = value;
  }

  clear_result(): void {
    this.result = undefined;
    this.reset();
  }

  reset(): void {
    const t = this;
    t.input = undefined;
    t.start.x = t.end.x = 0;
    t.start.y = t.end.y = 0;
    t.line_dash_offset = 0;
    t.height_diff = 0;
  }

  dispose(): void {
    //
  }

  update(dt: number, start_x: number, start_y: number): void {
    const t = this;
    if (!t.enabled) {
      return;
    }

    const ci = t.ci;

    t.line_dash_offset -= 0.6 * dt;
    if (t.line_dash_offset < 0) {
      t.line_dash_offset = 12;
    }

    const px = ci.get_pointer_x() | 0;
    const py = ci.get_pointer_y() | 0;

    if (!t.input && ci.is_primary_pointer_down()) {
      t.reset();
      t.start.x = start_x | 0;
      t.start.y = start_y | 0;

      t.input = { x: px, y: py };
      t.result = undefined;
    }

    if (t.input) {
      t.input.x = px;
      t.input.y = py;

      t.height_diff = start_y - t.input.y;
      if (ci.is_primary_pointer_up()) {
        if (t.height_diff <= MIN_JUMP_HEIGHT) {
          t.reset();
          return;
        }
        t.result = {
          p0: { x: t.start.x, y: t.start.y },
          p1: { x: t.input.x, y: t.input.y },
          p2: { x: t.end.x, y: t.end.y },
          id: id
        };
        id++;
        t.input = undefined;
        t.set_enabled(false);
      }
    }
  }

  draw(): void {
    const t = this;
    if (!t.input || !t.enabled) {
      return;
    }
    const ctx = t.kl.get_context_2d();

    const distance = t.input.x - t.start.x;
    t.end.x = (t.start.x + (distance * 2)) | 0;
    const offset = t.kl.get_canvas_height() - this.start.y;
    t.end.y = (t.start.y + offset) | 0;

    ctx.save();
    ctx.beginPath();

    ctx.moveTo(t.start.x, t.start.y);
    ctx.quadraticCurveTo(t.input.x, t.input.y, t.end.x, t.end.y);

    ctx.setLineDash([6, 6]);
    ctx.lineCap = "round";
    ctx.lineDashOffset = this.line_dash_offset;
    ctx.strokeStyle = t.height_diff > MIN_JUMP_HEIGHT ? ACTIVE_COLOR : INACTIVE_COLOR;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  private draw_parabola_through(ctx: Context, p0: Point, p1: Point, p2: Point, t: number | null = null): void {
    // Pick t by segment lengths (so p1 sits at the right "time" along the path)
    if (t == null) {
      const d01 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const d12 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      t = d01 / (d01 + d12);
      if (!isFinite(t) || t <= 0 || t >= 1) t = 0.5; // fallback
    }

    // Solve control point C so that B(t) = p1, where
    // B(t) = (1-t)^2 p0 + 2t(1-t) C + t^2 p2
    const omt = 1 - t;
    const denom = 2 * t * omt;
    const C = {
      x: (p1.x - omt * omt * p0.x - t * t * p2.x) / denom,
      y: (p1.y - omt * omt * p0.y - t * t * p2.y) / denom,
    };

    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(C.x, C.y, p2.x, p2.y);
  }
}
