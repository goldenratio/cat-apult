import { ProjectileResult } from "./hero_input.js";
import type { Karlib, Mutable, Rectangle } from "@goldenratio/karlib";
import { BloodParticle } from "./particle.js";
import type { Resource } from "./resource.js";

const SPEED = 1.6;
const DASH_SPEED = 6;

export class Hero {
  x: number = 0;
  y: number = 0;
  hit_rect: Mutable<Rectangle>;
  land_hit_rect: Mutable<Rectangle>;

  is_idle: boolean = false;
  is_wall_hit: boolean = false;
  is_alive: boolean = true;
  is_dash_mode: boolean = false;

  dash_distance: number = 0;
  flip: boolean = false;

  // callbacks
  player_died_callback: () => void | undefined = undefined;
  player_jump_started_callback: () => void | undefined = undefined;

  private projectile_data?: ProjectileResult = undefined;
  private dash_projectile_data?: ProjectileResult = undefined;;

  // start of parabola
  t_param: number = 0;
  private death_particles: BloodParticle[] = [];

  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
    x: number,
    y: number,
  ) {
    this.x = x;
    this.y = y;
    this.hit_rect = {
      x: this.x - 12,
      y: this.y - 15,
      width: 24,
      height: 30,
    };
    this.land_hit_rect = {
      x: this.x,
      y: this.y,
      width: 16,
      height: 10,
    };

  }

  set_is_idle(value: boolean): void {
    const t = this;
    if (t.is_idle === value) {
      return;
    }
    t.is_idle = value;
    if (value) {
      t.reset();
    }
  }

  set_x(value: number): void {
    this.x = value;
    this.update_hit_rect();
  }

  set_y(value: number): void {
    this.y = value;
    this.update_hit_rect();
  }

  set_alive(value: boolean): void {
    this.is_alive = value;
  }

  set_wall_hit_x(value: boolean, hero_new_x?: number): void {
    const t = this;
    if (t.is_wall_hit === value) {
      return;
    }
    t.is_wall_hit = value;
    if (typeof hero_new_x === 'number') {
      t.set_is_idle(false);
      t.set_x(hero_new_x);
      t.reset();
    }
  }

  set_wall_hit_y(value: boolean, hero_new_y?: number): void {
    const t = this;
    if (t.is_wall_hit === value) {
      return;
    }
    t.is_wall_hit = value;
    if (typeof hero_new_y === 'number') {
      t.set_is_idle(false);
      t.set_y(hero_new_y);
      t.reset();
    }
  }

  reset(): void {
    const t = this;
    t.t_param = 0;
    t.projectile_data = undefined;
    t.dash_projectile_data = undefined;
    t.is_dash_mode = false;
    // t.dash_distance = 0;

    // callbacks
    t.player_died_callback = undefined;
  }

  update(dt: number, projectile_data?: ProjectileResult): void {
    const t = this;
    if (!t.is_alive) {
      // death animation?
      if (t.death_particles.length > 0) {
        for (let i = t.death_particles.length - 1; i >= 0; i--) {
          const particle = t.death_particles[i];
          particle.update(dt);
          if (particle.scale <= 0.2) {
            t.death_particles.splice(i, 1);
          }
        }

        if (t.death_particles.length === 0) {
          t.player_died_animation_complete();
        }
      }
      return;
    }

    let pd = projectile_data;
    if (t.is_dash_mode) {
      if (!t.dash_projectile_data) {
        // t.set_is_idle(false);
        const tx = t.x | 0;
        const ty = t.y | 0;
        t.dash_projectile_data = {
          p0: { x: tx, y: ty },
          p1: { x: tx + t.dash_distance, y: ty - 70 },
          p2: { x: tx + t.dash_distance * 2, y: ty - 6 },
          id: -1,
        };
      }
      pd = t.dash_projectile_data;
    }

    if (!t.is_idle && t.t_param === 0 && !t.is_dash_mode) {
      // console.log("falling down!");
      t.y += 10 * dt;
      t.update_hit_rect();
      return;
    }

    if (pd) {
      t.set_projectile_data(pd);
      if (t.is_idle || !t.projectile_data) {
        return;
      }

      const speed = t.is_dash_mode ? DASH_SPEED : SPEED;
      t.t_param += (speed / 100) * dt; // normalize dt in seconds
      if (t.t_param > 1) {
        // end of parabola
        // t.t_param = 1;
      }
      // quadratic Bezier interpolation
      const { p0, p1, p2 } = t.projectile_data;
      const tp = t.t_param;
      const x = (1 - tp) * (1 - tp) * p0.x + 2 * (1 - tp) * tp * p1.x + tp * tp * p2.x;
      const y = (1 - tp) * (1 - tp) * p0.y + 2 * (1 - tp) * tp * p1.y + tp * tp * p2.y;

      t.x = x;
      t.y = y;
      t.flip = t.projectile_data.p1.x < t.projectile_data.p0.x;
      t.update_hit_rect();
    }
  }

  perform_dash(): void {
    const t = this;
    const current_pd = t.projectile_data;
    t.dash_distance = current_pd ? (current_pd.p1.x - current_pd.p0.x) >> 2 : 0;
    console.log("perform dash! distance: ", t.dash_distance);
    this.reset();
    this.is_dash_mode = true;
  }

  player_died(fn: () => void): void {
    console.log("player died!");
    const t = this;
    t.set_alive(false);
    t.player_died_callback = fn;

    for (let i = 0; i < 30; i++) {
      t.death_particles.push(new BloodParticle(t.x - 16, t.y - 16));
    }
  }

  player_on_jump_started(fn: () => void): void {
    this.player_jump_started_callback = fn;
  }

  private player_died_animation_complete(): void {
    console.log("player died animation complete!");
    this.player_died_callback?.();
    this.player_died_callback = undefined;
  }

  private set_projectile_data(value: ProjectileResult): void {
    const t = this;
    if (t.projectile_data?.id === value.id) {
      return;
    }
    t.player_jump_started_callback?.();
    t.set_is_idle(false);
    t.projectile_data = value;
    t.t_param = 0;
  }

  private update_hit_rect(): void {
    const t = this;
    t.hit_rect.x = t.x - 12;
    t.hit_rect.y = t.y - 15;
    t.land_hit_rect.x = t.x - 8;
    t.land_hit_rect.y = t.y + 6;
  }

  draw(): void {
    const t = this;
    const kl = t.kl;

    if (!t.is_alive) {
      for (let i = 0; i < t.death_particles.length; i++) {
        const particle = t.death_particles[i];
        kl.draw_texture({
          texture: t.res.orb_collected_texture,
          x: particle.x,
          y: particle.y,
          scale: particle.scale,
          tint_alpha: 0.7,
          tint_color: "#ff0000",
          alpha: 0.6,
        });
      }

      return;
    }

    const scale = t.flip ? { x: -1, y: 1 } : undefined;
    const rotate = t.is_dash_mode && !t.is_idle ? 15 : undefined;
    kl.draw_texture({
      texture: t.res.cat_black_texture,
      x: t.x,
      y: t.y,
      pivot: { x: 0.5, y: 0.5 },
      scale,
      rotate,
    });
  }

  dispose(): void {
    const t = this;
    t.player_died_animation_complete = undefined;
    t.player_jump_started_callback = undefined;
    t.death_particles.length = 0;
  }
}
