import "dotenv/config";

import { readdir, access, constants } from "fs/promises";
import { join } from "path";
import { build } from "esbuild";
import { env } from "node:process";

const srcDir = `src/functions`;
const outDir = `dist`;

const functionDirs = await readdir(join(import.meta.dirname, srcDir));
const entryPoints = functionDirs.map(async (entry) => {
  const path = `${srcDir}/${entry}/index.ts`;

  try {
    await access(path, constants.F_OK);
    return path;
  } catch (error) {
    return null;
  }
});

const define = {};
for (const k in env) {
  if (k.startsWith("INLINE_")) {
    define[`import.meta.env.${k}`] = JSON.stringify(env[k]);
  }
}

build({
  format: "esm",
  entryPoints: await Promise.all(entryPoints),
  bundle: true,
  outdir: join(import.meta.dirname, outDir),
  outbase: srcDir,
  platform: "node",
  sourcemap: "inline",
  define,
});
