import { RAND_2, RAND_3 } from "./random.js";

export class BloodParticle {
  x: number;
  y: number;
  scale: number;
  speedX: number;
  speedY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.scale = RAND_2.get_next() + 1;
    this.speedX = RAND_3.get_next() - 1.5;
    this.speedY = RAND_3.get_next() - 1.5;
  }

  update(dt: number): void {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    if (this.scale > 0.2) {
      this.scale -= 0.1 * dt;
    }
  }
}
