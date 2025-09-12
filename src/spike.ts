import type { Karlib, Mutable, Point, Rectangle } from "@goldenratio/karlib";
import type { Resource } from "./resource.js";

export const enum SpikeType {
  Default = 1,
  Escalator,
}

export class Spike {
  x: number;
  y: number;
  width: number;
  height: number;
  hit_rect: Mutable<Rectangle>;
  type: SpikeType;
  view: SpikeView;

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    type: SpikeType,
    x: number,
    y: number,
    width: number,
    height: number,
    flip_direction: number = 0,
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hit_rect = {
      x: x,
      y: y,
      width: width,
      height: height >> 1
    };

    if (type == SpikeType.Escalator) {
      this.view = new EscalatorSpikeSystem(x, y, width, height, flip_direction);
    } else {
      this.view = new DefaultSpikeSystem(x, y, width, height, flip_direction);
    }
  }

  dispose(): void {
    //
  }

  update(dt: number): void {
    this.view.update(dt);
  }

  draw(): void {
    this.view.draw(this.kl, this.res);
  }
}

interface SpikeView {
  update(dt: number): void;
  draw(kl: Karlib, res: Resource): void;
}

class DefaultSpikeSystem {
  x: number;
  y: number;
  width: number;
  height: number;
  flip_direction: number;
  rotate: number | undefined;

  constructor(x: number, y: number, width: number, height: number, flip_direction: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.flip_direction = flip_direction;
    this.rotate = height > width ? 90 : undefined;
    if (flip_direction === 1 && this.rotate === 90) {
      this.rotate *= -1;
    }
  }

  update(dt: number): void {
    // empty
  }

  draw(kl: Karlib, res: Resource): void {
    const t = this;
    let scale: Point | undefined = undefined;
    if (t.flip_direction === 1 && t.rotate !== 90) {
      scale = { x: 1, y: -1 };
    }
    kl.draw_texture_tile({
      texture: res.spike_texture,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      tile_scale: scale,
      tile_rotate: t.rotate,
    });
  }
}

class EscalatorSpikeSystem {
  x: number;
  y: number;
  width: number;
  height: number;
  tile_position: number = 0;
  flip_direction: number;
  rotate: number | undefined;

  constructor(x: number, y: number, width: number, height: number, flip_direction: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.flip_direction = flip_direction;
    this.rotate = height > width ? 90 : undefined;
    if (flip_direction === 1 && this.rotate === 90) {
      this.rotate *= -1;
    }
  }

  update(dt: number): void {
    const t = this;
    t.tile_position += 1 * dt;
    if (t.tile_position > 32) {
      t.tile_position = 0;
    }
  }

  draw(kl: Karlib, res: Resource): void {
    const t = this;
    let scale: Point | undefined = undefined;
    if (t.flip_direction === 1 && t.rotate !== 90) {
      scale = { x: 1, y: -1 };
    }
    const is_vertical = t.rotate === 90 || t.rotate === -90;
    kl.draw_texture_tile({
      texture: res.spike_texture,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      tile_position_x: !is_vertical ? t.tile_position : undefined,
      tile_position_y: is_vertical ? t.tile_position : undefined,
      tile_scale: scale,
      tile_rotate: t.rotate,
    });
  }
}
