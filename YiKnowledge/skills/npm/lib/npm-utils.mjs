/**
 * npm-utils.mjs — Shared npm CLI helpers
 *
 * Extracted from rui-npm.mjs for reuse by auth.mjs and publish.mjs.
 */

import { spawnSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { get } from "node:https";
import { nowISO, fmtDisplay } from "../../../lib/fs.mjs";

export const REGISTRY_OFFICIAL = "https://registry.npmjs.org/";
export const NPM_TOKEN = process.env.NPM_TOKEN || "";

if (NPM_TOKEN) {
  spawnSync("npm", ["config", "set", "//registry.npmjs.org/:_authToken", NPM_TOKEN], {
    encoding: "utf-8", stdio: "pipe",
  });
}

export function registryArgs() {
  if (!NPM_TOKEN) return [];
  const defaultRegistry = spawnSync("npm", ["config", "get", "registry"], { encoding: "utf-8" }).stdout.trim();
  return defaultRegistry !== REGISTRY_OFFICIAL ? ["--registry", REGISTRY_OFFICIAL] : [];
}

export function npm(/** @type {string[]} */ args, /** @type {any} */ opts = {}) {
  return spawnSync("npm", args, {
    encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    ...opts, env: { ...process.env, ...opts.env },
  });
}

export function npmStream(/** @type {string[]} */ args, /** @type {any} */ opts = {}) {
  return spawn("npm", args, {
    stdio: "inherit", ...opts, env: { ...process.env, ...opts.env },
  });
}

export function checkNpm() {
  const r = npm(["--version"]);
  if (r.error || r.status !== 0) {
    console.error("❌ npm not detected. Please install Node.js first (https://nodejs.org)");
    process.exit(1);
  }
  const version = r.stdout.trim();
  const major = parseInt(version.split(".")[0], 10);
  if (major < 7) console.warn(`⚠️  npm version ${version} is outdated, recommend upgrading to 7.x+.`);
  return version;
}

export function checkPackageJson() {
  if (!existsSync("package.json")) {
    console.error("❌ No package.json in current directory. Please run npm init first to initialize the project.");
    process.exit(1);
  }
}

export function maskToken(/** @type {string} */ token) {
  if (!token || token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}

export function timestamp() {
  return fmtDisplay(nowISO());
}

export function toTable(/** @type {string[]} */ headers, /** @type {any[][]} */ rows) {
  if (!rows.length) return "(No results)";
  const cols = headers.map((/** @type {string} */ h, /** @type {number} */ i) => {
    const cells = [h, ...rows.map((/** @type {any[]} */ r) => String(r[i] ?? ""))];
    const maxW = Math.max(...cells.map((/** @type {any} */ c) => String(c).length));
    return { maxW, key: i };
  });
  const sep = cols.map((/** @type {{maxW: number, key: number}} */ c) => "─".repeat(c.maxW)).join("─┼─");
  const headerLine = cols.map((/** @type {{maxW: number, key: number}} */ c, /** @type {number} */ i) => String(headers[i]).padEnd(c.maxW)).join(" │ ");
  const lines = rows.map(
    (/** @type {any[]} */ row) => cols.map((/** @type {{maxW: number, key: number}} */ c, /** @type {number} */ i) => String(row[i] ?? "").padEnd(c.maxW)).join(" │ ")
  );
  return [headerLine, sep, ...lines].join("\n");
}

export function httpGetJson(/** @type {string} */ url) {
  return new Promise((resolve, reject) => {
    get(url, (/** @type {any} */ res) => {
      let data = "";
      res.on("data", (/** @type {string} */ chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}