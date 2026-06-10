/**
 * npm-utils.mjs — Shared npm CLI helpers
 *
 * Extracted from rui-npm.mjs for reuse by auth.mjs and publish.mjs.
 */

import { spawnSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { get } from "node:https";

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

export function npm(args, opts = {}) {
  return spawnSync("npm", args, {
    encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"],
    ...opts, env: { ...process.env, ...opts.env },
  });
}

export function npmStream(args, opts = {}) {
  return spawn("npm", args, {
    stdio: "inherit", ...opts, env: { ...process.env, ...opts.env },
  });
}

export function checkNpm() {
  const r = npm(["--version"]);
  if (r.error || r.status !== 0) {
    console.error("❌ 未检测到 npm。请先安装 Node.js (https://nodejs.org)");
    process.exit(1);
  }
  const version = r.stdout.trim();
  const major = parseInt(version.split(".")[0], 10);
  if (major < 7) console.warn(`⚠️  npm 版本 ${version} 过旧，建议升级至 7.x+。`);
  return version;
}

export function checkPackageJson() {
  if (!existsSync("package.json")) {
    console.error("❌ 当前目录无 package.json。请先执行 npm init 初始化项目。");
    process.exit(1);
  }
}

export function maskToken(token) {
  if (!token || token.length <= 8) return "****";
  return token.slice(0, 4) + "****" + token.slice(-4);
}

export function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export function toTable(headers, rows) {
  if (!rows.length) return "(无结果)";
  const cols = headers.map((h, i) => {
    const cells = [h, ...rows.map((r) => String(r[i] ?? ""))];
    const maxW = Math.max(...cells.map((c) => String(c).length));
    return { maxW, key: i };
  });
  const sep = cols.map((c) => "─".repeat(c.maxW)).join("─┼─");
  const headerLine = cols.map((c, i) => String(headers[i]).padEnd(c.maxW)).join(" │ ");
  const lines = rows.map(
    (row) => cols.map((c, i) => String(row[i] ?? "").padEnd(c.maxW)).join(" │ ")
  );
  return [headerLine, sep, ...lines].join("\n");
}

export function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}
