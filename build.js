#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip } from 'node:zlib';
import { createHash } from "node:crypto";

import { build } from "esbuild";
import ClosureCompiler from "google-closure-compiler";

const destDir = "dist";
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
const pack_immutable_app = process?.argv?.includes("--immutable-app") ?? false;

function bytes_to_kilobytes(bytes) {
  const value = bytes / 1024;
  return Math.round(value * 100) / 100;
}

async function get_gzip_size(filePath) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const gzip = createGzip();

    fs.createReadStream(filePath)
      .pipe(gzip)
      .on("data", chunk => {
        size += chunk.length;
      })
      .on("end", () => resolve(size))
      .on("error", reject);
  });
}

/**
 * @param {string} res_dest_dir
 */
async function compress_with_closure(res_dest_dir) {
  return new Promise(async (resolve) => {
    const input_file = path.join("js", "main.js");
    const output_file = path.join(destDir, res_dest_dir, "main.js");
    const start_time = Date.now();

    const closure_compiler = new ClosureCompiler({
      js: input_file,
      compilation_level: "ADVANCED_OPTIMIZATIONS",
      language_in: "ECMASCRIPT_NEXT",
      language_out: "ECMASCRIPT_2020",
      js_output_file: output_file,
    });

    console.log(`compressing... ${input_file} -> ${output_file}`);
    closure_compiler.run(async (exitCode, _stdOut, stdErr) => {
      if (exitCode !== 0) {
        console.error(stdErr);
        process.exit(1);
      }

      const { size } = fs.statSync(output_file);
      const gzipSize = await get_gzip_size(output_file);
      console.log(`Bundle size: ${output_file} - ${bytes_to_kilobytes(size)} kB | gzip: ${bytes_to_kilobytes(gzipSize)} kB`)
      console.log(`completed in ${Date.now() - start_time}ms`);

      resolve();
    });
  });
}

/**
 * @param {string} res_dest_dir
 */
async function pack_resources(res_dest_dir) {
  console.log("\nCopying resources...");
  const start_time = Date.now();
  const src_dir = "res";

  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(path.join(destDir, res_dest_dir))) {
    fs.mkdirSync(path.join(destDir, res_dest_dir), { recursive: true });
  }
  const files = fs.readdirSync(src_dir, { withFileTypes: true });
  const skip_files = [".DS_Store"];

  for (const file of files) {
    if (file.isFile()) {
      if (skip_files.includes(file.name)) {
        continue;
      }

      const src_path = path.join(src_dir, file.name);
      const dest_path = path.join(destDir, res_dest_dir, file.name);

      if (file.name.includes("index.html")) {
        const html_dest_path = path.join(destDir, file.name);

        // minify html
        const html_content = fs.readFileSync(src_path, "utf8");
        const minified_html = html_content
          .replace(/[\r\n]+/g, '')
          .replace(/\s{2,}/g, '')
          .replace("${RES_DIR}", res_dest_dir)
          .trim();
        console.log(`Copied and minified ${file.name}`);
        fs.writeFileSync(html_dest_path, minified_html, "utf8");
        continue;
      }

      fs.copyFileSync(src_path, dest_path);
      console.log(`Copied ${file.name}`);
    }
  }
  console.log(`completed in ${Date.now() - start_time}ms`);
}

async function main() {
  const start_time = Date.now();
  const pkgPath = path.resolve(_dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const { version } = pkg;
  const version_hash = createHash("md5").update(version).digest("hex");

  const res_dir = pack_immutable_app ? `./${version_hash}/` : "./";

  const src_path = path.join("src", "main.ts");
  const dest_path = path.join("js", "main.js");

  console.log(`Building (v${version})... ${src_path} -> ${dest_path}`);
  await build({
    entryPoints: [src_path],
    outfile: dest_path,
    format: "esm",
    target: "esnext",
    treeShaking: true,
    bundle: true,
    minify: false,
    sourcemap: false,
    drop: ["console", "debugger"],
    define: {
      "process.env.RES_DIR": `"${res_dir}"`,
      "process.env.PROD": "true",
    }
  });

  console.log(`completed in ${Date.now() - start_time}ms`);

  // compress with google closure
  await compress_with_closure(res_dir);
  await pack_resources(res_dir);
  console.log(`\nTotal build finished in ${Date.now() - start_time}ms`);
}

main();
