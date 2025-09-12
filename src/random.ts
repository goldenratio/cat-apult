const size = 100;

class Random {
  private readonly list: readonly number[] = [];
  private index: number = (size / 2) | 0;

  constructor(max: number) {
    this.list = Array(size)
      .fill(0)
      .map(() => (Math.random() * max));
  }

  get_next(): number {
    const t = this;
    t.index++;
    if (t.index >= size) {
      t.index = 0;
    }
    return t.list[t.index] ?? 0;
  }
}

export const RAND_2 = new Random(2);
export const RAND_3 = new Random(3);
