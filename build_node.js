#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";

import { build } from "esbuild";

async function main() {
  const start_time = Date.now();
  const dest_dir = "js";
  const res_dir = "./res/";

  if (fs.existsSync(dest_dir)) {
    fs.rmSync(dest_dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dest_dir, { recursive: true });

  // copy resources
  // if (fs.existsSync("res")) {
  //   const files = fs.readdirSync("res");
  //   for (const file of files) {
  //     const src = path.join("res", file);
  //     const dest = path.join(destDir, file);
  //     fs.copyFileSync(src, dest);
  //   }
  // }

  console.log("Building...");

  await build({
    entryPoints: [path.join("src", "node", "main.ts")],
    outfile: path.join(dest_dir, "main.mjs"),
    format: "esm",
    target: ["node20"],
    platform: "node",
    external: ["skia-canvas", "@goldenratio/karlib"],
    treeShaking: true,
    bundle: true,
    minify: false,
    sourcemap: false,
    banner: { js: "#!/usr/bin/env node" },
    drop: ["console", "debugger"],
    define: {
      "process.env.RES_DIR": `"${res_dir}"`,
      "process.env.PROD": "true",
    }
  });

  console.log(`Build finished in ${Date.now() - start_time}ms`);
}

main();
