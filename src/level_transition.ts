import type { Karlib } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

const enum TransitionState {
  Start = 1,
  Middle,
  End,
}
export class LevelTransition {
  scale: number = 0;
  rotate: number = 0;
  direction: number = 1;
  state: TransitionState | undefined = undefined;
  callback: () => void | undefined = undefined;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
  ) {
    //
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    const t = this;

    if (!t.state || t.state === TransitionState.End) {
      return;
    }

    t.scale += 2 * dt * t.direction;
    t.rotate += 5 * dt * t.direction;

    if (t.rotate > 360) {
      t.rotate = 0;
    }

    if (t.scale > 70 && t.state === TransitionState.Start) {
      t.direction = -1;
      t.state = TransitionState.Middle;
      if (t.callback) {
        t.callback();
        t.callback = undefined;
      }
    }

    if (t.scale <= 0 && t.state === TransitionState.Middle) {
      t.direction = 1;
      t.state = TransitionState.End;
      t.transition_end();
    }
  }

  draw(): void {
    const t = this;
    if (!t.state) {
      return;
    }
    t.kl.draw_texture({
      texture: t.res.orb_collected_texture,
      x: t.kl.get_canvas_width() / 2,
      y: t.kl.get_canvas_height() / 2,
      scale: t.scale,
      pivot: { x: 0.5, y: 0.5 },
      rotate: t.rotate,
    })
  }

  start_transition(fn: () => void): void {
    console.log("level transition start!");
    const t = this;
    t.state = TransitionState.Start;
    t.callback = fn;
  }

  clear(): void {
    const t = this;
    t.callback = undefined;
    t.state = undefined;
    t.scale = 0;
    t.direction = 1;
  }

  private transition_end(): void {
    console.log("level transition end!");
    this.clear();
  }
}
