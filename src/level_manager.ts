import { Block, BlockType } from "./block.js";
import { BackgroundType } from "./background.js";
import type { Karlib, Point } from "@goldenratio/karlib";
import { Orb } from "./orbs.js";
import type { Resource } from "./resource.js";
import { Spike, SpikeType } from "./spike.js";
import { SlideBlock } from "./slide_block.js";
import { Bugger, BuggerType } from "./bugger.js";

export interface LevelData {
  readonly hero_position: Point;
  readonly orbs: Orb[];
  readonly blocks: Block[];
  readonly spikes?: Spike[];
  readonly slide_blocks?: SlideBlock[];
  readonly buggers?: Bugger[],
  readonly bg?: BackgroundType;
}

const BRICK_SIZE = 32;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function level_0(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, GAME_HEIGHT),
      new Block(kl, res, BlockType.WallVertical, GAME_WIDTH - BRICK_SIZE, 0, BRICK_SIZE * 2, GAME_HEIGHT),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, GAME_WIDTH, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, 0, GAME_HEIGHT - BRICK_SIZE, GAME_WIDTH, BRICK_SIZE),
    ],
    orbs: [
      new Orb(kl, res, 200, 300),
      new Orb(kl, res, 400, 400),
      new Orb(kl, res, 600, 300),
    ],
    hero_position: { x: 100, y: 420 }
  };
}

function level_1(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE * 4, GAME_HEIGHT),
      new Block(kl, res, BlockType.WallVertical, GAME_WIDTH - BRICK_SIZE * 4, 0, BRICK_SIZE * 6, GAME_HEIGHT),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, GAME_WIDTH, BRICK_SIZE * 4),
      new Block(kl, res, BlockType.Floor, 0, GAME_HEIGHT - BRICK_SIZE * 4, GAME_WIDTH, BRICK_SIZE * 4),
    ],
    orbs: [
      new Orb(kl, res, 180, 300),
      new Orb(kl, res, 380, 200),
      new Orb(kl, res, 600, 300),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Default, 220, 440, 32 * 2, 32),
      new Spike(kl, res, SpikeType.Default, 500, 440, 32 * 2, 32),
    ],
    hero_position: { x: 380, y: 360 }
  };
}

function level_2(kl: Karlib, res: Resource): LevelData {
  return {
    bg: BackgroundType.Title,
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallHorizontal, BRICK_SIZE, 236, 200, BRICK_SIZE),
      new Block(kl, res, BlockType.WallHorizontal, 570, 236, 200, BRICK_SIZE),
      new Block(kl, res, BlockType.WallHorizontal, BRICK_SIZE, 268, 300, BRICK_SIZE),
      new Block(kl, res, BlockType.WallHorizontal, 470, 268, 300, BRICK_SIZE),
      new Block(kl, res, BlockType.WallHorizontal, 0, 300, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, BRICK_SIZE, 470, 100, 32),
      new Block(kl, res, BlockType.Floor, 0, 500, 800, 200),
      new Block(kl, res, BlockType.Floor, 800 - 100 - BRICK_SIZE, 470, 100, 32),
    ],
    orbs: [
      new Orb(kl, res, 550, 400),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Escalator, 132, 470, 536, 32),
    ],
    hero_position: { x: 70, y: 300 }
  };
}

function level_3(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE * 2, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE * 2, 0, BRICK_SIZE * 2, 600),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE * 2),
      new Block(kl, res, BlockType.Floor, 0, 600 - BRICK_SIZE * 2, 800, BRICK_SIZE * 2),
      new Block(kl, res, BlockType.Floor, 64, 160, 200, 32),
      new Block(kl, res, BlockType.Floor, 200, 300, 540, 32),
      new Block(kl, res, BlockType.Floor, 60, 420, 32, 32),
      new Block(kl, res, BlockType.Floor, 536, 472, 200, 64),
    ],
    orbs: [
      new Orb(kl, res, 400, 200),
      new Orb(kl, res, 600, 400),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Default, 200, 270, 32 * 7, 32),
      new Spike(kl, res, SpikeType.Default, 542, 270, 32 * 6, 32),
      new Spike(kl, res, SpikeType.Escalator, 64, 504, 472, 32),
    ],
    hero_position: { x: 90, y: 70 }
  };
}

function level_4(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 400 - BRICK_SIZE, 0, BRICK_SIZE, 240),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE),

      new Block(kl, res, BlockType.Floor, 400, 208, 180, 32),
      new Block(kl, res, BlockType.Floor, 188, 208, 180, 32),

      new Block(kl, res, BlockType.Floor, 0, 540, 800, 64),
    ],
    orbs: [
      new Orb(kl, res, 240, 100),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Default, 190, 240, 32 * 12, 32, 1),
      new Spike(kl, res, SpikeType.Escalator, BRICK_SIZE, 508, 96 * 8, 32),
    ],
    slide_blocks: [
      new SlideBlock(kl, res, 60, 460, 200, 32, 730),
    ],
    hero_position: { x: 450, y: 100 }
  };
}

function level_5(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.WallHorizontal, 0, 600 - BRICK_SIZE, 800, BRICK_SIZE),

      new Block(kl, res, BlockType.Floor, 120, 460, 160, 32),
      new Block(kl, res, BlockType.Floor, 500, 460, 160, 32),
    ],
    orbs: [
      new Orb(kl, res, 370, 200),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Default, BRICK_SIZE, BRICK_SIZE, 96 * 8, 32, 1),
      new Spike(kl, res, SpikeType.Default, BRICK_SIZE, 536, 96 * 8, 32),
      new Spike(kl, res, SpikeType.Default, BRICK_SIZE, (BRICK_SIZE * 2) + 8, 32, 32 * 14),
      new Spike(kl, res, SpikeType.Default, 770 - BRICK_SIZE, (BRICK_SIZE * 2) + 8, 32, 32 * 14, 1),
    ],
    buggers: [
      new Bugger(kl, res, BuggerType.CircleSpin, 378, 280),
      new Bugger(kl, res, BuggerType.CircleSpin, 580, 320, 10),

    ],
    hero_position: { x: 200, y: 300 }
  };
}

function level_6(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE * 3, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, 0, 600 - BRICK_SIZE, 800, BRICK_SIZE),

      new Block(kl, res, BlockType.Floor, 94, 200, 300, 32 * 2),
      new Block(kl, res, BlockType.WallHorizontal, 94, 232, 300, 32),

      new Block(kl, res, BlockType.Floor, 540, 200, 100, 32 * 2),
      new Block(kl, res, BlockType.WallHorizontal, 540, 232, 100, 32),

      new Block(kl, res, BlockType.Floor, 94, 360, 100, 32 * 7),

      new Block(kl, res, BlockType.Floor, 190, 472, 580, 32 * 3),
      new Block(kl, res, BlockType.FallingFloor, 580, 400, 100, 32),
    ],
    orbs: [
      new Orb(kl, res, 140, 140),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Escalator, BRICK_SIZE * 3, BRICK_SIZE, 32 * 22, 32, 1),
      new Spike(kl, res, SpikeType.Escalator, 194, 440, 32 * 18, 32),
      new Spike(kl, res, SpikeType.Default, 266, 168, 32 * 4, 32),
      new Spike(kl, res, SpikeType.Default, 542, 264, 32 * 3, 32, 1),
    ],
    hero_position: { x: 160, y: 300 }
  };
}

function level_7(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, 0, 600 - BRICK_SIZE, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, 320, 160, 160, 32),
    ],
    orbs: [
      new Orb(kl, res, 120, 220),
      new Orb(kl, res, 560, 220),
      new Orb(kl, res, 600, 400),
      new Orb(kl, res, 160, 400),
    ],
    slide_blocks: [
      new SlideBlock(kl, res, 60, 260, 100, 32, 260),
      new SlideBlock(kl, res, 520, 260, 100, 32, 740),
      new SlideBlock(kl, res, 60, 460, 200, 32, 730),

    ],
    spikes: [
      new Spike(kl, res, SpikeType.Escalator, BRICK_SIZE, BRICK_SIZE, 32 * 24, 32, 1),
      new Spike(kl, res, SpikeType.Escalator, BRICK_SIZE, 540, 32 * 24, 32),
    ],
    buggers: [
      new Bugger(kl, res, BuggerType.CircleSpin, 512, 276),
      new Bugger(kl, res, BuggerType.CircleSpin, 268, 276, 10),
    ],
    hero_position: { x: 380, y: 80 }
  };
}

function level_8(kl: Karlib, res: Resource): LevelData {
  return {
    blocks: [
      new Block(kl, res, BlockType.WallVertical, 0, 0, BRICK_SIZE, 600),
      new Block(kl, res, BlockType.WallVertical, 800 - BRICK_SIZE, 0, BRICK_SIZE, 600),


      new Block(kl, res, BlockType.WallVertical, 228, 132, BRICK_SIZE, 200),
      new Block(kl, res, BlockType.WallHorizontal, 260, 300, 540, BRICK_SIZE),

      new Block(kl, res, BlockType.WallHorizontal, 0, 0, 800, BRICK_SIZE),
      new Block(kl, res, BlockType.Floor, 0, 600 - BRICK_SIZE, 800, BRICK_SIZE),

      new Block(kl, res, BlockType.Floor, 330, 480, 160, 32 * 3),
      new Block(kl, res, BlockType.FallingFloor, 32, 440, 100, 32),

      new Block(kl, res, BlockType.Floor, 228, 120, 380, 32),
      new Block(kl, res, BlockType.WallHorizontal, 270, 136, 338, 16),

    ],
    orbs: [
      new Orb(kl, res, 440, 180),
    ],
    spikes: [
      new Spike(kl, res, SpikeType.Default, 330, 448, 32, 32),
      new Spike(kl, res, SpikeType.Default, 458, 448, 32, 32),
      new Spike(kl, res, SpikeType.Escalator, 32, 536, 32 * 10, 32),
      new Spike(kl, res, SpikeType.Escalator, 490, 536, 32 * 10, 32),
      new Spike(kl, res, SpikeType.Default, 260, 270, 32 * 16, 32),
      new Spike(kl, res, SpikeType.Default, 260, 164, 32, 32 * 3),
    ],
    slide_blocks: [
      new SlideBlock(kl, res, 400, 238, 60, 32, 730),
    ],
    hero_position: { x: 406, y: 300 }
  };
}

export class LevelManager {
  private readonly level_map: Record<string, (kl: Karlib, res: Resource) => LevelData | undefined>;
  constructor(
    private readonly kl: Karlib,
    private readonly res: Resource,
  ) {
    this.level_map = {
      "l0": (kl: Karlib, res: Resource) => level_0(kl, res),
      "l1": (kl: Karlib, res: Resource) => level_1(kl, res),
      "l2": (kl: Karlib, res: Resource) => level_2(kl, res),
      "l3": (kl: Karlib, res: Resource) => level_3(kl, res),
      "l4": (kl: Karlib, res: Resource) => level_4(kl, res),
      "l5": (kl: Karlib, res: Resource) => level_5(kl, res),
      "l6": (kl: Karlib, res: Resource) => level_6(kl, res),
      "l7": (kl: Karlib, res: Resource) => level_7(kl, res),
      "l8": (kl: Karlib, res: Resource) => level_8(kl, res),
    };
  }

  get_level(level: number): LevelData | undefined {
    const t = this;
    return t.level_map[`l${level}`]?.(t.kl, t.res);
  }
}
