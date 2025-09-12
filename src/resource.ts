import type { BrowserEnv, Karlib, Texture } from "@goldenratio/karlib";
import { create_big_text_texture } from "./text.js";

export interface Resource {
  readonly cat_black_texture: Texture;
  readonly orb_texture: Texture;
  readonly orb_collected_texture: Texture;
  readonly spike_texture: Texture;
  readonly font_texture: Texture;
  readonly bg_texture: Texture;
  readonly black_texture: Texture;
  readonly title_texture: Texture;
  readonly bugger_texture: Texture;
}

export class AssetLoader {
  constructor(
    private readonly kl: Karlib,
  ) {
    // empty
  }

  async load(): Promise<Resource> {
    const t = this;
    const res_dir = process.env.RES_DIR;
    try {
      const cat_black_texture = await t.kl.load_texture(`${res_dir}cb.png`);
      const font_texture = await t.kl.load_texture(`${res_dir}f.png`);
      const bg_texture = await t.kl.load_texture(`${res_dir}bt.png`);
      const orb_texture = await t.kl.load_texture(`${res_dir}o.png`);
      const orb_collected_texture = await t.kl.load_texture(`${res_dir}oc.png`);
      const spike_texture = await t.kl.load_texture(`${res_dir}sp.png`);
      const black_texture = await t.kl.load_texture(`${res_dir}bl.png`);
      const bugger_texture = await t.kl.load_texture(`${res_dir}br.png`);

      // warmup runtime textures
      t.kl.get_tinted_texture(orb_collected_texture, "#fff", 1);

      const title_texture = create_big_text_texture(
        {
          text: "CAT-APULT",
          font: "bold 32px Arial",
          width: 180,
          height: 46,
          fontHeight: 28,
          depth: 3,
          colors: [
            [225, 219, 219], [151, 117, 117]
          ],
          // threshold: 64
        },
        this.kl.get_env()
      );

      const res: Resource = {
        cat_black_texture,
        orb_texture,
        orb_collected_texture,
        spike_texture,
        font_texture,
        bg_texture,
        black_texture,
        title_texture,
        bugger_texture,
      };
      return res;
    } catch (err) {
      console.error("Error loading resource: ", err);
    }
  }
}
