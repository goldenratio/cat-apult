import type { Karlib } from "@goldenratio/karlib";
import { CanvasInteraction } from "./canvas_interaction.js";
import type { Resource } from "./resource.js";
import { BitmapText } from "./text.js";

export class WinMessage {
  can_show: boolean = false;
  alpha: number = 0;
  secondary_alpha: number = 0;
  frame_count: number = 0;

  animation_complete_callback: () => void | undefined = undefined;
  tap_state: number = 0;

  constructor(
    private readonly kl: Karlib,
    private readonly ci: CanvasInteraction,
    private readonly res: Resource,
    private readonly text: Readonly<BitmapText>,
  ) {
    //
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    const t = this;
    if (!t.can_show || !t.animation_complete_callback) {
      return;
    }

    t.alpha += 0.02 * dt;
    if (t.alpha > 1) {
      t.alpha = 1;
    }

    if (t.alpha > 0.5) {
      t.secondary_alpha += 0.05 * dt;
    }
    if (t.secondary_alpha > 1) {
      t.secondary_alpha = 1;
      t.frame_count += 1 * dt;
    }

    if (t.frame_count > 20 && t.animation_complete_callback) {
      t.frame_count = 20;
      if (t.tap_state === 0 && t.ci.is_primary_pointer_down()) {
        t.tap_state = 1;
      }

      if (t.tap_state === 1 && t.ci.is_primary_pointer_up()) {
        t.tap_state = 2;
        t.animation_complete_callback();
        t.animation_complete_callback = undefined;
      }
    }
  }

  draw(): void {
    const t = this;
    if (!t.can_show) {
      return;
    }

    let ty = 200;
    t.kl.draw_texture({
      texture: t.res.title_texture,
      scale: 3,
      pivot: { x: 0.5, y: 0.5 },
      x: t.kl.get_canvas_width() >> 1,
      y: ty,
      alpha: t.alpha,
    });

    ty += 100;
    t.text.draw_text("congrats", {
      x: 260,
      y: ty,
      scale: 2,
      alpha: t.secondary_alpha,
    });

    ty += 50;
    t.text.draw_text("you have finished the game", {
      x: 200,
      y: ty,
      alpha: t.secondary_alpha,
    });

    ty += 100;
    t.text.draw_text("tap to play again", {
      x: 260,
      y: ty,
      alpha: t.secondary_alpha,
      color: "#7e5e5e"
    });
  }

  show(fn: () => void): void {
    console.log("show win message!");
    const t = this;
    if (t.can_show) {
      return;
    }
    t.can_show = true;
    t.alpha = 0;
    t.secondary_alpha = 0;
    t.frame_count = 0;
    t.tap_state = 0;
    t.animation_complete_callback = fn;
  }

  hide(): void {
    this.can_show = false;
  }
}
