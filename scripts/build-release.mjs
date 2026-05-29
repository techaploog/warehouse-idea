#!/usr/bin/env node
// Standalone release packager. Run after `pnpm build` (which produces
// frontend/.next/standalone and backend/dist).
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const releaseDir = join(repoRoot, "release");
const stagingDir = join(releaseDir, "staging");
const stagingFE = join(stagingDir, "frontend");
const stagingBE = join(stagingDir, "backend");
const FE = join(repoRoot, "frontend");
const BE = join(repoRoot, "backend");

function sh(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: repoRoot, ...opts });
}

async function readVersion() {
  const pkg = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8"));
  if (!pkg.version) throw new Error("Root package.json is missing `version`.");
  return pkg.version;
}

async function stageFrontend() {
  const standalone = join(FE, ".next", "standalone");
  if (!existsSync(standalone)) {
    throw new Error(
      `Missing ${standalone}. Is output: "standalone" set in frontend/next.config.ts?`,
    );
  }
  // Copy the whole standalone tree. In a pnpm monorepo the layout is:
  //   standalone/node_modules/   (workspace-shared deps)
  //   standalone/frontend/       (the actual Next app, server.js lives here)
  // Keep symlinks as symlinks — the zip step uses `zip -ry` which preserves
  // them, and `unzip` recreates them on extract. (Dereferencing here would
  // both bloat the zip and choke on dangling links in pnpm's .pnpm tree.)
  // verbatimSymlinks keeps relative link targets as-is so the unpacked
  // archive works on any machine (without it, cp resolves the link target
  // against the source location and writes an absolute path).
  await cp(standalone, stagingFE, { recursive: true, verbatimSymlinks: true });
  // `.next/static` and `public/` go INSIDE the inner frontend/ folder, where
  // server.js expects to find them.
  const innerApp = join(stagingFE, "frontend");
  await cp(join(FE, ".next", "static"), join(innerApp, ".next", "static"), {
    recursive: true,
  });
  await cp(join(FE, "public"), join(innerApp, "public"), { recursive: true });
  await cp(join(FE, ".env.example"), join(stagingFE, ".env.example"));
  // Wrapper at frontend/server.js so the run command is `node ./server.js`
  // (or `node ./frontend/server.js` from the release root). chdir keeps Next's
  // .env loading and cwd-based bits pointing at the inner standalone app dir.
  // CJS to match Next's standalone server.js (and avoid an ESM-detection warning).
  await writeFile(
    join(stagingFE, "server.js"),
    `const path = require("node:path");
process.chdir(path.join(__dirname, "frontend"));
require("./frontend/server.js");
`,
  );
  await writeFile(
    join(stagingFE, "README.md"),
    "Run: `node server.js` (default port 3000, override with `PORT=`).\n",
  );
}

async function stageBackend() {
  // pnpm deploy: copies the backend package + resolves prod-only node_modules,
  // inlining workspace deps like @warehouse/shared. It honours .gitignore, so
  // `dist/` is excluded (gitignored) and a lot of source/config we don't want
  // is included. We compensate below: copy dist/ over, then prune.
  // CI=true bypasses pnpm's "no TTY" guard on the internal `pnpm install
  // --production` step that deploy runs (only matters when this script is
  // invoked from another pnpm script, which strips the TTY).
  sh(`pnpm --filter backend deploy --prod --legacy "${stagingBE}"`, {
    env: { ...process.env, CI: "true" },
  });
  await cp(join(BE, "dist"), join(stagingBE, "dist"), { recursive: true });
  await cp(
    join(BE, "src", "database", "migrations"),
    join(stagingBE, "migrations"),
    { recursive: true },
  );
  await cp(join(BE, ".env.example"), join(stagingBE, ".env.example"));
  // Wrapper at backend/server.js so the run command is `node ./server.js`.
  // chdir to the release's backend/ so dotenv finds .env next to the wrapper.
  // CJS to match the nest-built dist/ (and avoid an ESM-detection warning).
  await writeFile(
    join(stagingBE, "server.js"),
    `process.chdir(__dirname);
require("./dist/src/main.js");
`,
  );
  await writeFile(
    join(stagingBE, "README.md"),
    "Run: `node server.js`\nMigrate: `pnpm db:migrate`\n",
  );
  // Prune anything outside the keep-list pnpm deploy dumped in.
  const keep = new Set([
    "node_modules",
    "package.json",
    "dist",
    "migrations",
    ".env.example",
    "README.md",
    "server.js",
  ]);
  for (const entry of await readdir(stagingBE)) {
    if (!keep.has(entry)) {
      await rm(join(stagingBE, entry), { recursive: true, force: true });
    }
  }
}

async function zipRelease(version) {
  const zipPath = join(releaseDir, `release-v${version}.zip`);
  // `zip -r -y` recurses and stores symlinks as symlinks (so pnpm's
  // standalone tree round-trips correctly through unzip). Run inside
  // stagingDir so the archive's top-level entries are `frontend/` and
  // `backend/` (not the absolute staging path).
  sh(`zip -r -y -q "${zipPath}" frontend backend`, { cwd: stagingDir });
  console.log(`✓ Wrote ${zipPath}`);
}

async function main() {
  const version = await readVersion();
  console.log(`Building release v${version}`);
  await rm(releaseDir, { recursive: true, force: true });
  await mkdir(stagingDir, { recursive: true });
  await stageFrontend();
  await stageBackend();
  await zipRelease(version);
  await rm(stagingDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
