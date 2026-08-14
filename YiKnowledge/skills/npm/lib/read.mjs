/**
 * rui-npm read — read-only subcommands (search, list, info)
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { npm, checkPackageJson, toTable, timestamp } from "./npm-utils.mjs";

export function cmdSearch(/** @type {string} */ keyword, /** @type {any} */ args) {
  if (!keyword) {
    console.error("❌ Please provide search keyword. Usage: rui-npm search <keyword>");
    console.error("   Example: rui-npm search react");
    process.exit(1);
  }
  console.log(`🔍 Searching "${keyword}" ...`);
  const r = npm(["search", keyword, "--json", "--long"]);
  if (r.status !== 0 || !r.stdout) {
    console.error("❌ Search failed. npm registry may be unreachable, please try again later.");
    console.error(`   Manual access: https://www.npmjs.com/search?q=${encodeURIComponent(keyword)}`);
    process.exit(1);
  }
  let results;
  try { results = JSON.parse(r.stdout); } catch {
    console.error("❌ Failed to parse search results.");
    process.exit(1);
  }
  if (!Array.isArray(results) || results.length === 0) {
    console.log(`No results found for "${keyword}".`);
    return;
  }
  results.sort((a, b) => {
    const da = a.downloads?.weekly ?? 0;
    const db = b.downloads?.weekly ?? 0;
    return db - da;
  });
  const top = results.slice(0, args.limit);
  if (args.json) {
    console.log(JSON.stringify(top, null, 2));
    return;
  }
  console.log(`\n## npm Search Results — "${keyword}" (${timestamp()})\n`);
  const headers = ["#", "Package Name", "Version", "Weekly Downloads", "Description"];
  const rows = top.map((p, i) => [
    i + 1,
    p.name ?? "?",
    p.version ?? "?",
    p.downloads?.weekly ? `${(p.downloads.weekly / 1000).toFixed(1)}k/w` : "?",
    (p.description ?? "").substring(0, 60),
  ]);
  console.log(toTable(headers, rows));
  console.log(`\n> ${results.length} results, showing top ${top.length}. Use --json for full data.`);
}

export function cmdList(/** @type {any} */ args) {
  checkPackageJson();
  const npmArgs = ["list", "--json"];
  if (args.depth !== undefined) npmArgs.push("--depth", String(args.depth));
  const r = npm(npmArgs);
  if (r.status !== 0) {
    console.error("❌ Failed to list dependencies.");
    process.exit(1);
  }
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    console.error("❌ Failed to parse dependency data.");
    process.exit(1);
  }
  if (args.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  /** @type {any[]} */
  const flat = [];
  function walk(/** @type {any} */ deps, /** @type {string} */ prefix) {
    if (!deps) return;
    for (const [name, info] of Object.entries(deps)) {
      flat.push({ name, version: info.version ?? "?", depth: prefix.split("─").length - 1 });
      if (info.dependencies) walk(info.dependencies, prefix + "─");
    }
  }
  walk(data.dependencies, "");
  const headers = ["Package Name", "Version", "Level"];
  const rows = flat.map((d) => [d.name, d.version, String(d.depth)]);
  console.log(`\n## Installed Dependencies (${flat.length} packages)\n`);
  console.log(toTable(headers, rows));
}

export function cmdInfo(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm info <pkg>");
    process.exit(1);
  }
  console.log(`📋 Querying ${pkg} ...`);
  const r = npm(["view", pkg, "--json"]);
  if (r.status !== 0) {
    console.error(`❌ Package "${pkg}" does not exist in npm registry or network is unreachable.`);
    console.error(`   Try: /rui-npm search ${pkg}`);
    process.exit(1);
  }
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    console.error("❌ Failed to parse package info.");
    process.exit(1);
  }
  if (args.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  const p = Array.isArray(data) ? data[data.length - 1] : data;
  console.log(`\n## ${p.name} — Package Info\n`);
  console.log(`| Field | Value |`);
  console.log(`|------|-----|`);
  console.log(`| Name | ${p.name ?? "?"} |`);
  console.log(`| Description | ${p.description ?? "—"} |`);
  console.log(`| Latest Version | ${p.version ?? "?"} |`);
  console.log(`| License | ${p.license ?? "—"} |`);
  console.log(`| Homepage | ${p.homepage ?? "—"} |`);
  console.log(`| Repository | ${p.repository?.url ?? "—"} |`);
  if (p.maintainers?.length) {
    console.log(`| Maintainers | ${p.maintainers.map((/** @type {any} */ m) => m.name ?? m.email).join(", ")} |`);
  }
  if (p.keywords?.length) {
    console.log(`| Keywords | ${p.keywords.slice(0, 10).join(", ")} |`);
  }
  if (p.versions) {
    const versions = Array.isArray(p.versions) ? p.versions : Object.keys(p.versions);
    const recent = versions.slice(-10).reverse();
    console.log(`| Recent Versions | ${recent.join(", ")} |`);
  }
  if (p.dependencies) {
    const deps = Object.keys(p.dependencies);
    if (deps.length) {
      console.log(`| Dependencies (${deps.length}) | ${deps.slice(0, 10).join(", ")}${deps.length > 10 ? " ..." : ""} |`);
    }
  }
  console.log();
}