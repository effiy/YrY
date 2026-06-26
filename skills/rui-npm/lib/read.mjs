/**
 * rui-npm read — read-only subcommands (search, list, info)
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { npm, checkPackageJson, toTable, timestamp } from "./npm-utils.mjs";

export function cmdSearch(/** @type {string} */ keyword, /** @type {any} */ args) {
  if (!keyword) {
    console.error("❌ 请提供搜索关键词。用法: rui-npm search <keyword>");
    console.error("   示例: rui-npm search react");
    process.exit(1);
  }
  console.log(`🔍 搜索 "${keyword}" ...`);
  const r = npm(["search", keyword, "--json", "--long"]);
  if (r.status !== 0 || !r.stdout) {
    console.error("❌ 搜索失败。npm registry 可能不可达，请稍后重试。");
    console.error(`   手动访问: https://www.npmjs.com/search?q=${encodeURIComponent(keyword)}`);
    process.exit(1);
  }
  let results;
  try { results = JSON.parse(r.stdout); } catch {
    console.error("❌ 解析搜索结果失败。");
    process.exit(1);
  }
  if (!Array.isArray(results) || results.length === 0) {
    console.log(`未找到与 "${keyword}" 相关的包。`);
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
  console.log(`\n## npm 搜索结果 — "${keyword}"（${timestamp()}）\n`);
  const headers = ["#", "包名", "版本", "周下载量", "描述"];
  const rows = top.map((p, i) => [
    i + 1,
    p.name ?? "?",
    p.version ?? "?",
    p.downloads?.weekly ? `${(p.downloads.weekly / 1000).toFixed(1)}k/w` : "?",
    (p.description ?? "").substring(0, 60),
  ]);
  console.log(toTable(headers, rows));
  console.log(`\n> 共 ${results.length} 条结果，展示前 ${top.length} 条。使用 --json 查看完整数据。`);
}

export function cmdList(/** @type {any} */ args) {
  checkPackageJson();
  const npmArgs = ["list", "--json"];
  if (args.depth !== undefined) npmArgs.push("--depth", String(args.depth));
  const r = npm(npmArgs);
  if (r.status !== 0) {
    console.error("❌ 列出依赖失败。");
    process.exit(1);
  }
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    console.error("❌ 解析依赖数据失败。");
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
  const headers = ["包名", "版本", "层级"];
  const rows = flat.map((d) => [d.name, d.version, String(d.depth)]);
  console.log(`\n## 已安装依赖（${flat.length} 个包）\n`);
  console.log(toTable(headers, rows));
}

export function cmdInfo(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm info <pkg>");
    process.exit(1);
  }
  console.log(`📋 查询 ${pkg} ...`);
  const r = npm(["view", pkg, "--json"]);
  if (r.status !== 0) {
    console.error(`❌ 包 "${pkg}" 在 npm registry 中不存在或网络不可达。`);
    console.error(`   可尝试: /rui-npm search ${pkg}`);
    process.exit(1);
  }
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    console.error("❌ 解析包信息失败。");
    process.exit(1);
  }
  if (args.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  const p = Array.isArray(data) ? data[data.length - 1] : data;
  console.log(`\n## ${p.name} — 包信息\n`);
  console.log(`| 字段 | 值 |`);
  console.log(`|------|-----|`);
  console.log(`| 名称 | ${p.name ?? "?"} |`);
  console.log(`| 描述 | ${p.description ?? "—"} |`);
  console.log(`| 最新版本 | ${p.version ?? "?"} |`);
  console.log(`| 许可证 | ${p.license ?? "—"} |`);
  console.log(`| 主页 | ${p.homepage ?? "—"} |`);
  console.log(`| 仓库 | ${p.repository?.url ?? "—"} |`);
  if (p.maintainers?.length) {
    console.log(`| 维护者 | ${p.maintainers.map((/** @type {any} */ m) => m.name ?? m.email).join(", ")} |`);
  }
  if (p.keywords?.length) {
    console.log(`| 关键词 | ${p.keywords.slice(0, 10).join(", ")} |`);
  }
  if (p.versions) {
    const versions = Array.isArray(p.versions) ? p.versions : Object.keys(p.versions);
    const recent = versions.slice(-10).reverse();
    console.log(`| 最近版本 | ${recent.join(", ")} |`);
  }
  if (p.dependencies) {
    const deps = Object.keys(p.dependencies);
    if (deps.length) {
      console.log(`| 依赖 (${deps.length}) | ${deps.slice(0, 10).join(", ")}${deps.length > 10 ? " ..." : ""} |`);
    }
  }
  console.log();
}
