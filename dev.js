#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const destDir = "dist";

async function run_command(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = exec(cmd, { ...options });
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
    proc.on("close", code => {
      if (code !== 0) reject(new Error(`${cmd} exited with ${code}`));
      else resolve();
    });
  });
}

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function main() {
  const res_dir = "./";

  try {
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
    fs.mkdirSync(destDir, { recursive: true });

    // copy resources
    if (fs.existsSync("res")) {
      const files = fs.readdirSync("res");
      for (const file of files) {
        const src = path.join("res", file);
        const dest = path.join(destDir, file);

        if (file.includes("index.html")) {
          // minify html
          const html_content = fs.readFileSync(src, "utf8");
          const updated_html = html_content
            .replace("${RES_DIR}", res_dir)
            .trim();
          fs.writeFileSync(dest, updated_html, "utf8");
          continue;
        }

        // else just copy/paste
        fs.copyFileSync(src, dest);
      }
    }

    const esbuild_path = path.join("node_modules", ".bin", "esbuild");
    const cmd = [
      esbuild_path,
      "./src/main.ts",
      "--bundle",
      `--outdir=${destDir}`,
      "--sourcemap=inline",
      "--watch",
      `--servedir=${destDir}`,
      `--define:process.env.RES_DIR='"${res_dir}"'`,
      `--define:process.env.PROD='false'`,
    ].join(" ");

    run_command(cmd);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
