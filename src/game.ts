import { is_rect_colliding } from "@goldenratio/karlib";
import type { Karlib, Rectangle } from "@goldenratio/karlib";

import { Hero } from "./hero.js";
import { BitmapText } from "./text.js";
import { HeroControls } from "./hero_input.js";
import { AssetLoader, type Resource } from "./resource.js";
import { Block, BlockType } from "./block.js";
import { Orb } from "./orbs.js";
import { Spike } from "./spike.js";
import { LevelTransition } from "./level_transition.js";
import { LevelManager } from "./level_manager.js";
import { WinMessage } from "./win_message.js";
import { BackgroundType, GameBackground } from "./background.js";
import type { CanvasInteraction } from "./canvas_interaction.js";
import { SlideBlock } from "./slide_block.js";
import { Bugger } from "./bugger.js";

export class Game {
  private is_assets_ready = false;

  private res!: Resource;

  private hero!: Readonly<Hero>;
  private hero_controls!: Readonly<HeroControls>;
  private blocks: Block[] = [];
  private slide_blocks: SlideBlock[] = [];
  private buggers: Bugger[] = [];
  private orbs: Orb[] = [];
  private spikes: Spike[] = [];

  // singletons
  private level_transition!: LevelTransition;
  private level_manager!: LevelManager;
  private win_message!: Readonly<WinMessage>;
  private text!: Readonly<BitmapText>;
  private background!: GameBackground;
  private ci!: CanvasInteraction;

  private current_level: number = 0;

  constructor(
    private readonly kl: Karlib,
    canvas_interaction?: CanvasInteraction,
  ) {
    this.ci = canvas_interaction;
  }

  set_canvas_interaction(value: CanvasInteraction): void {
    this.ci = value;
  }

  async load_assets(): Promise<void> {
    const t = this;
    const asset_loader = new AssetLoader(t.kl);
    t.res = await asset_loader.load();
  }

  init(): void {
    const t = this;
    const kl = t.kl;
    const res = t.res;

    t.text = new BitmapText(kl, res);
    t.level_manager = new LevelManager(kl, res);
    t.level_transition = new LevelTransition(kl, res);
    t.win_message = new WinMessage(kl, t.ci, res, t.text);
    t.background = new GameBackground(kl, res);

    t.load_level(0);
  }

  update(dt: number): void {
    const t = this;
    if (!t.is_assets_ready) {
      return;
    }

    t.background.update(dt);
    t.level_transition.update(dt);
    t.win_message.update(dt);

    if (!t.hero) {
      return;
    }
    // check for collisions
    if (!t.hero.is_idle && t.hero.is_alive) {
      for (let i = 0; i < t.blocks.length; i++) {
        const block = t.blocks[i];
        const hero_target_rect = block.type === BlockType.Floor ? t.hero.land_hit_rect : t.hero.hit_rect;
        if (is_rect_colliding(block.hit_rect, hero_target_rect)) {
          t.player_hit_block(block);
          break;
        }
      }

      for (let i = 0; i < t.slide_blocks.length; i++) {
        const block = t.slide_blocks[i];
        if (!block.is_moving && is_rect_colliding(block.hit_rect, t.hero.land_hit_rect)) {
          t.player_hit_floor(block.y);
          break;
        }
      }

      for (let i = 0; i < t.orbs.length; i++) {
        const orb = t.orbs[i];
        if (!orb.is_collected && is_rect_colliding(orb.hit_rect, t.hero.hit_rect)) {
          t.player_collect_orb(orb);
          break;
        }
      }

      for (let i = 0; i < t.spikes.length; i++) {
        const spike = t.spikes[i];
        if (is_rect_colliding(spike.hit_rect, t.hero.hit_rect)) {
          t.player_died();
          break;
        }
      }

      for (let i = 0; i < t.buggers.length; i++) {
        const bugger = t.buggers[i];
        if (is_rect_colliding(bugger.hit_rect, t.hero.hit_rect)) {
          t.player_died();
          break;
        }
      }

      if (t.hero.hit_rect.y > 600) {
        t.player_died();
      }
    }

    // makes player fall, when falling floor disappears
    if (t.hero.is_idle && t.hero.is_alive) {
      for (let i = 0; i < t.blocks.length; i++) {
        const block = t.blocks[i];
        if (
          block.type === BlockType.FallingFloor
          && !block.is_active
          && is_rect_colliding(block.hit_rect, t.hero.hit_rect)
        ) {
          t.hero.set_is_idle(false);
        }
      }
      for (let i = 0; i < t.buggers.length; i++) {
        const bugger = t.buggers[i];
        if (is_rect_colliding(bugger.hit_rect, t.hero.hit_rect)) {
          t.player_died();
          break;
        }
      }
    }

    const hx = t.hero.x;
    const hy = t.hero.y;

    t.hero_controls.update(dt, hx, hy);
    t.hero.update(dt, t.hero_controls.result);

    for (let i = 0; i < t.orbs.length; i++) {
      t.orbs[i].update(dt);
    }

    for (let i = 0; i < t.blocks.length; i++) {
      t.blocks[i].update(dt);
    }

    for (let i = 0; i < t.spikes.length; i++) {
      t.spikes[i].update(dt);
    }

    for (let i = 0; i < t.slide_blocks.length; i++) {
      t.slide_blocks[i].update(dt);
    }

    for (let i = 0; i < t.buggers.length; i++) {
      t.buggers[i].update(dt);
    }
  }

  draw(): void {
    const t = this;
    const kl = t.kl;

    kl.clear_background("#e1d1d1");


    // draw bg
    t.background.draw();

    if (t.current_level === 0) {
      t.text.draw_text("tap to aim and jump", {
        x: 240,
        y: 140,
        color: "#7e5e5e",
      });
      t.text.draw_text("collect all balls, to go to next level", {
        x: 90,
        y: 170,
        color: "#7e5e5e",
      });

    } else if (t.current_level === 2) {
      t.kl.draw_texture({
        texture: t.res.title_texture,
        scale: 3,
        pivot: { x: 0.5, y: 0.5 },
        x: 400,
        y: 120,
      });

      t.text.draw_text("a game by karthik vj", {
        x: 220,
        y: 180,
        color: "#7e5e5e",
      });
      t.text.draw_text("labrat.mobi", {
        x: 280,
        y: 210,
        color: "#7e5e5e",
      });
    }

    for (let i = 0; i < t.orbs.length; i++) {
      t.orbs[i].draw();
    }

    for (let i = 0; i < t.blocks.length; i++) {
      t.blocks[i].draw();
    }

    for (let i = 0; i < t.spikes.length; i++) {
      t.spikes[i].draw();
    }

    for (let i = 0; i < t.slide_blocks.length; i++) {
      t.slide_blocks[i].draw();
    }

    for (let i = 0; i < t.buggers.length; i++) {
      t.buggers[i].draw();
    }

    if (t.hero_controls) {
      t.hero_controls.draw();
    }

    if (t.hero) {
      t.hero.draw();
    }

    t.win_message.draw();
    t.level_transition.draw();
    // t.draw_debug();
  }

  draw_fps(fps: number): void {
    this.text.draw_text(`fps: ${fps}`, { x: 10, y: 582 });
  }

  private load_level(next_level: number): void {
    const t = this;
    t.dispose_level();

    const level_data = t.level_manager.get_level(next_level);
    if (!level_data) {
      t.game_finished();
      return;
    }

    t.current_level = next_level;

    console.log(`load level! ${t.current_level}`);
    const kl = t.kl;
    const res = t.res;

    t.hero = new Hero(kl, res, level_data.hero_position.x, level_data.hero_position.y);
    t.hero.player_on_jump_started(() => t.player_jump_started());
    t.hero_controls = new HeroControls(kl, t.ci);

    t.background.set_background(level_data.bg ?? BackgroundType.Default);

    // entities
    t.blocks = level_data.blocks;
    t.orbs = level_data.orbs;
    t.spikes = level_data.spikes ?? [];
    t.slide_blocks = level_data.slide_blocks ?? [];
    t.buggers = level_data.buggers ?? [];

    t.is_assets_ready = true;
  }

  private dispose_level(): void {
    const t = this;
    console.log(`dispose level! ${t.current_level}`);
    if (t.hero) {
      t.hero.dispose();
      t.hero = undefined;
    }

    if (t.hero_controls) {
      t.hero_controls.dispose();
      t.hero_controls = undefined;
    }

    t.blocks.forEach(item => item.dispose());
    t.blocks.length = 0;

    t.orbs.forEach(item => item.dispose());
    t.orbs.length = 0;

    t.spikes.forEach(item => item.dispose());
    t.spikes.length = 0;

    t.slide_blocks.forEach(item => item.dispose());
    t.slide_blocks.length = 0;

    t.buggers.forEach(item => item.dispose());
    t.buggers.length = 0;
  }

  private draw_debug(): void {
    const t = this;
    t.blocks.forEach(item => {
      t.draw_hit_rect(item.hit_rect);
    });

    t.orbs.forEach(item => {
      t.draw_hit_rect(item.hit_rect);
    });

    t.spikes.forEach(item => {
      t.draw_hit_rect(item.hit_rect);
    });

    t.slide_blocks.forEach(item => {
      t.draw_hit_rect(item.hit_rect);
    });

    t.buggers.forEach(item => {
      t.draw_hit_rect(item.hit_rect);
    });

    if (t.hero) {
      t.draw_hit_rect(t.hero.hit_rect);
      t.draw_hit_rect(t.hero.land_hit_rect);
    }
  }

  private draw_hit_rect(rect: Rectangle): void {
    const t = this;
    t.kl.draw_rectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      alpha: 0.5,
    });
  }

  private player_hit_block(block: Readonly<Block>): void {
    const offset = 16;
    const t = this;

    if (block.type === BlockType.WallVertical) {
      const x = t.hero.flip ? block.x + block.width + offset : block.x - offset;
      // console.log("player hit wall! ", x, t.hero.flip);
      t.hero.set_wall_hit_x(true, x);
      t.hero_controls.clear_result();
      return;
    }

    if (block.type === BlockType.WallHorizontal) {
      const y = block.y + block.height + offset;
      // console.log("player hit wall horizontal! ", y);
      t.hero.set_wall_hit_y(true, y);
      t.hero_controls.clear_result();
      return;
    }

    if (block.is_active) {
      block.player_hit_floor();
      t.player_hit_floor(block.y);
    }
  }

  private player_hit_floor(floor_y: number): void {
    const offset = 16;
    const t = this;
    console.log("player land on block!");
    t.hero.set_wall_hit_x(false);
    t.hero.set_wall_hit_y(false);
    t.hero.set_is_idle(true);
    t.hero.set_y(floor_y - offset);
    t.hero_controls.clear_result();

    const orbs_pending = t.orbs.some(orb => orb.is_collected === false);
    if (orbs_pending) {
      // level should continue
      t.hero_controls.set_enabled(true);
    } else {
      t.player_level_completed();
    }
  }

  private player_collect_orb(orb: Readonly<Orb>): void {
    console.log("player collect orb!");
    const t = this;
    orb.set_is_collected(true);
    // t.input.clear_result();
    t.hero.perform_dash();
  }

  private player_died(): void {
    this.hero.player_died(() => {
      this.respawn();
    });
  }

  private respawn(): void {
    console.log("respawn!");
    this.load_level(this.current_level);
  }

  private player_level_completed(): void {
    console.log("Level Complete!");
    this.level_transition.start_transition(() => {
      console.log("level transition callback invoked!");
      const next_level = this.current_level + 1;
      this.load_level(next_level);
    });
  }

  private player_jump_started(): void {
    console.log("player jump started!");
    const t = this;
    if (!t.hero.is_dash_mode) {
      for (let i = 0; i < t.slide_blocks.length; i++) {
        t.slide_blocks[i].toggle();
      }
    }
  }

  private game_finished(): void {
    console.log("Game Finished!");
    this.background.set_background(BackgroundType.Win);
    this.win_message.show(() => {
      console.log("win message callback! restart game!");
      this.level_transition.start_transition(() => {
        this.win_message.hide();
        this.load_level(0);
      });
    });
  }

  dispose(): void {
    this.dispose_level();
  }
}
