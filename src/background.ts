import type { Karlib } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

export const enum BackgroundType {
  Default = 1,
  Win,
  Title,
}

export class GameBackground {
  private readonly backgrounds: Record<BackgroundType, Background>;

  current_background: Background | undefined = undefined;
  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource
  ) {
    this.backgrounds = {
      [BackgroundType.Default]: new DefaultBackground(),
      [BackgroundType.Win]: new WinBackground(),
      [BackgroundType.Title]: new TitleBackground(),
    }

    this.current_background = this.backgrounds[BackgroundType.Default];
  }

  set_background(type: BackgroundType): void {
    this.current_background = this.backgrounds[type];
  }

  update(dt: number): void {
    if (this.current_background) {
      this.current_background.update(dt);
    }
  }

  draw(): void {
    if (this.current_background) {
      this.current_background.draw(this.kl, this.res);
    }
  }

  dispose(): void {
    //
  }
}

interface Background {
  update(dt: number): void;
  draw(kl: Karlib, res: Resource): void;
}

class DefaultBackground implements Background {
  update(dt: number): void {
    // empty
  }

  draw(kl: Karlib, res: Resource): void {
    kl.draw_texture_tile({
      texture: res.bg_texture,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      tile_alpha: 0.2,
      tile_scale: 4,
    });
  }
}

class WinBackground implements Background {
  tile_pos_x: number = 0;
  tile_pos_y: number = 0;

  update(dt: number): void {
    this.tile_pos_x += 0.1 * dt;
    // this.tile_pos_y += 1 * dt;
  }

  draw(kl: Karlib, res: Resource): void {
    kl.draw_texture_tile({
      texture: res.bg_texture,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      tile_alpha: 0.2,
      tile_scale: 4,
      tile_position_x: this.tile_pos_x,
      tile_position_y: this.tile_pos_y,
    });
  }
}

class TitleBackground implements Background {
  tile_pos_x: number = 0;
  tile_pos_y: number = 0;
  tile_rotate: number = 0;

  update(dt: number): void {
    this.tile_pos_x += 0.1 * dt;
    this.tile_rotate += 0.1 * dt;
    // this.tile_pos_y += 1 * dt;
  }

  draw(kl: Karlib, res: Resource): void {
    kl.draw_texture_tile({
      texture: res.bg_texture,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      tile_alpha: 0.2,
      tile_scale: 4,
      tile_position_x: this.tile_pos_x,
      tile_position_y: this.tile_pos_y,
      tile_rotate: this.tile_rotate,
    });
  }
}
