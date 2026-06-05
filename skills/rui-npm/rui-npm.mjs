#!/usr/bin/env node
// rui-npm — personal npm package manager
// 用法: node skills/rui-npm/rui-npm.mjs <command> [options]
//
// 子命令:
//   search    <keyword>           搜索 npm registry
//   install   <pkg>[@version]     安装包
//   update    <pkg>               更新包
//   list      [--depth N]         列出已安装包
//   info      <pkg>               查看包信息
//   uninstall <pkg>               卸载包
//   publish   <path>              发布本地文件/目录
//   npx       <pkg>[@version]     npx 执行包
//   audit                         安全审计

import { spawnSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

// ─── Helpers ────────────────────────────────────────────────────

function npm(args, opts = {}) {
  const result = spawnSync("npm", args, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    ...opts,
    env: { ...process.env, ...opts.env },
  });
  return result;
}

function npmStream(args, opts = {}) {
  return spawn("npm", args, {
    stdio: "inherit",
    ...opts,
    env: { ...process.env, ...opts.env },
  });
}

function checkNpm() {
  const r = npm(["--version"]);
  if (r.error || r.status !== 0) {
    console.error("❌ 未检测到 npm。请先安装 Node.js (https://nodejs.org)");
    process.exit(1);
  }
  const version = r.stdout.trim();
  const major = parseInt(version.split(".")[0], 10);
  if (major < 7) {
    console.warn(`⚠️  npm 版本 ${version} 过旧，建议升级至 7.x+。部分功能可能降级。`);
  }
  return version;
}

function checkPackageJson() {
  if (!existsSync("package.json")) {
    console.error("❌ 当前目录无 package.json。请先执行 npm init 初始化项目。");
    process.exit(1);
  }
}

function checkNpmLogin() {
  const r = npm(["whoami"]);
  if (r.status !== 0) {
    console.error("❌ 未登录 npm。请先执行 npm login 登录你的 npm 账户。");
    console.error("   （如无账户，请先访问 https://www.npmjs.com/signup 注册）");
    process.exit(1);
  }
  return r.stdout.trim();
}

function toTable(headers, rows) {
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

function parseArgs(argv) {
  const args = { _: [], json: false, depth: 0, dev: false, global: false, limit: 20,
    name: null, version: "1.0.0", description: null, access: null, dryRun: false,
    npxArgs: [], raw: [] };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === "--json") { args.json = true; }
    else if (a === "--dev" || a === "-D") { args.dev = true; }
    else if (a === "--global" || a === "-g") { args.global = true; }
    else if (a === "--depth") { args.depth = parseInt(argv[++i], 10); }
    else if (a === "--limit") { args.limit = parseInt(argv[++i], 10); }
    else if (a === "--name") { args.name = argv[++i]; }
    else if (a === "--version") { args.version = argv[++i]; }
    else if (a === "--description") { args.description = argv[++i]; }
    else if (a === "--access") { args.access = argv[++i]; }
    else if (a === "--dry-run") { args.dryRun = true; }
    else if (a === "--") { args.npxArgs = argv.slice(i + 1); i = argv.length; }
    else if (a.startsWith("-")) { args.raw.push(a); }
    else { args._.push(a); }
    i++;
  }
  return args;
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

// ─── Subcommands ────────────────────────────────────────────────

function cmdSearch(keyword, args) {
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
  // Sort by weekly downloads desc
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

function cmdInstall(pkg, args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm install <pkg>[@version]");
    console.error("   示例: rui-npm install lodash@4.17.21");
    process.exit(1);
  }
  if (!args.global) checkPackageJson();
  const npmArgs = ["install"];
  if (args.global) npmArgs.push("-g");
  if (args.dev) npmArgs.push("--save-dev");
  else if (!args.global) npmArgs.push("--save");
  npmArgs.push(pkg);
  console.log(`📦 安装 ${pkg} ...`);
  const result = spawnSync("npm", npmArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 安装失败（退出码 ${result.status}）。请检查包名是否正确。`);
    console.error(`   可尝试: /rui-npm search ${pkg.split("@")[0]}`);
    process.exit(result.status);
  }
  // Show installed version
  const pkgName = pkg.split("@")[0];
  const info = npm(["list", pkgName, "--json", "--depth", "0"]);
  try {
    const parsed = JSON.parse(info.stdout);
    const version = parsed?.dependencies?.[pkgName]?.version ?? "?";
    console.log(`✅ ${pkgName}@${version} 安装完成`);
  } catch {
    console.log(`✅ ${pkg} 安装完成`);
  }
}

function cmdUpdate(pkg, args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm update <pkg>");
    process.exit(1);
  }
  checkPackageJson();
  // Get current version
  const before = npm(["list", pkg, "--json", "--depth", "0"]);
  let beforeVer = "?";
  try { beforeVer = JSON.parse(before.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch {}
  console.log(`⬆️  更新 ${pkg} (当前: ${beforeVer}) ...`);
  const result = spawnSync("npm", ["update", pkg], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 更新失败（退出码 ${result.status}）。`);
    process.exit(result.status);
  }
  const after = npm(["list", pkg, "--json", "--depth", "0"]);
  let afterVer = "?";
  try { afterVer = JSON.parse(after.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch {}
  if (beforeVer !== afterVer) {
    console.log(`✅ ${pkg}: ${beforeVer} → ${afterVer}`);
  } else {
    console.log(`✅ ${pkg}@${afterVer} 已是最新兼容版本`);
  }
}

function cmdList(args) {
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
  // Flatten dependencies
  const flat = [];
  function walk(deps, prefix) {
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

function cmdInfo(pkg, args) {
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
  // Handle array (multiple versions)
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
    console.log(`| 维护者 | ${p.maintainers.map((m) => m.name ?? m.email).join(", ")} |`);
  }
  if (p.keywords?.length) {
    console.log(`| 关键词 | ${p.keywords.slice(0, 10).join(", ")} |`);
  }
  // Versions
  if (p.versions) {
    const versions = Array.isArray(p.versions) ? p.versions : Object.keys(p.versions);
    const recent = versions.slice(-10).reverse();
    console.log(`| 最近版本 | ${recent.join(", ")} |`);
  }
  // Dependencies
  if (p.dependencies) {
    const deps = Object.keys(p.dependencies);
    if (deps.length) {
      console.log(`| 依赖 (${deps.length}) | ${deps.slice(0, 10).join(", ")}${deps.length > 10 ? " ..." : ""} |`);
    }
  }
  console.log();
}

function cmdUninstall(pkg, args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm uninstall <pkg>");
    process.exit(1);
  }
  checkPackageJson();
  console.log(`🗑️  卸载 ${pkg} ...`);
  const result = spawnSync("npm", ["uninstall", pkg], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 卸载失败（退出码 ${result.status}）。请确认包 "${pkg}" 已安装。`);
    process.exit(result.status);
  }
  console.log(`✅ ${pkg} 已卸载`);
}

function cmdPublish(path, args) {
  if (!path) {
    console.error("❌ 请提供文件或目录路径。用法: rui-npm publish <path>");
    console.error("   示例: rui-npm publish ./my-script.js --name my-util");
    process.exit(1);
  }
  const absPath = resolve(path);
  if (!existsSync(absPath)) {
    console.error(`❌ 路径不存在: ${absPath}`);
    process.exit(1);
  }
  const isDir = statSync(absPath).isDirectory();
  const npmUser = checkNpmLogin();
  console.log(`👤 已登录 npm: ${npmUser}`);

  let publishDir = absPath;
  let tmpDir = null;

  // File mode: create temp directory with auto-generated package.json
  if (!isDir) {
    tmpDir = join(tmpdir(), `rui-npm-${randomBytes(6).toString("hex")}`);
    mkdirSync(tmpDir, { recursive: true });
    const ext = basename(absPath).endsWith(".mjs") ? ".mjs" : ".js";
    const destFile = join(tmpDir, `index${ext}`);
    writeFileSync(destFile, readFileSync(absPath, "utf-8"));
    publishDir = tmpDir;
  }

  // Check / generate package.json
  const pkgJsonPath = join(publishDir, "package.json");
  const pkgName = args.name || basename(absPath).replace(/\.[^.]+$/, "").replace(/[^a-z0-9._-]/g, "-");

  if (!existsSync(pkgJsonPath)) {
    console.log(`📝 自动生成 package.json (name: ${pkgName}) ...`);
    const pkgJson = {
      name: pkgName,
      version: args.version,
      description: args.description || `Auto-published by rui-npm — ${basename(absPath)}`,
      main: isDir ? (existsSync(join(publishDir, "index.js")) ? "index.js" : undefined) : `index${require("node:path").extname(absPath)}`,
      bin: !isDir ? { [pkgName]: `./index${require("node:path").extname(absPath)}` } : undefined,
      license: "MIT",
    };
    // Clean undefined keys
    for (const k of Object.keys(pkgJson)) {
      if (pkgJson[k] === undefined) delete pkgJson[k];
    }
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
    console.log(`   包名: ${pkgName}`);
    console.log(`   版本: ${args.version}`);
  } else {
    // Validate existing package.json
    try {
      const existing = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      console.log(`📝 使用已有 package.json: ${existing.name}@${existing.version}`);
    } catch {
      console.error("❌ package.json 格式无效，请修正后重试。");
      if (tmpDir) {
        const { rmSync } = require("node:fs");
        rmSync(tmpDir, { recursive: true, force: true });
      }
      process.exit(1);
    }
  }

  // Conflict check
  console.log(`🔍 检查 registry 是否存在同名包 "${pkgName}" ...`);
  const check = npm(["view", pkgName, "version"]);
  if (check.status === 0) {
    console.error(`❌ npm registry 已存在包 "${pkgName}" (${check.stdout.trim()})。`);
    console.error(`   请使用 --name 指定不同的包名，或使用 npm deprecate 废弃旧版本。`);
    if (tmpDir) {
      const { rmSync } = require("node:fs");
      rmSync(tmpDir, { recursive: true, force: true });
    }
    process.exit(1);
  }

  // Publish
  const npmArgs = ["publish"];
  if (args.access) npmArgs.push("--access", args.access);
  if (args.dryRun) npmArgs.push("--dry-run");
  console.log(args.dryRun ? "🧪 模拟发布 (--dry-run) ..." : "🚀 发布中 ...");
  const result = spawnSync("npm", npmArgs, {
    cwd: publishDir,
    stdio: "inherit",
    encoding: "utf-8",
  });

  // Cleanup temp dir
  if (tmpDir) {
    const { rmSync } = require("node:fs");
    rmSync(tmpDir, { recursive: true, force: true });
  }

  if (result.status !== 0) {
    console.error(`❌ 发布失败（退出码 ${result.status}）。`);
    process.exit(result.status);
  }
  if (!args.dryRun) {
    console.log(`✅ ${pkgName}@${args.version} 发布成功`);
    console.log(`   安装: npm install ${pkgName}`);
    console.log(`   运行: npx ${pkgName}`);
  }
}

function cmdNpx(pkg, args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm npx <pkg>[@version]");
    console.error("   示例: rui-npm npx create-react-app -- my-app");
    process.exit(1);
  }
  const npxArgs = ["--yes", pkg, ...args.npxArgs];
  console.log(`▶️  npx ${pkg}${args.npxArgs.length ? " " + args.npxArgs.join(" ") : ""}`);
  const result = spawnSync("npx", npxArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.error) {
    console.error(`❌ npx 执行失败: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ npx 执行返回退出码 ${result.status}`);
    process.exit(result.status);
  }
}

function cmdAudit(args) {
  checkPackageJson();
  console.log("🔒 审计依赖安全漏洞 ...");
  const r = npm(["audit", "--json"]);
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    // npm audit returns non-zero on vulnerabilities, parse anyway
    try { data = JSON.parse(r.stdout || r.stderr || "{}"); } catch {
      console.error("❌ 安全审计失败。npm registry 可能不可达。");
      process.exit(1);
    }
  }
  if (args.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  const vulns = data.vulnerabilities || {};
  const summary = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
  const details = [];
  for (const [name, v] of Object.entries(vulns)) {
    summary[v.severity] = (summary[v.severity] || 0) + 1;
    if (v.via?.length) {
      const viaList = v.via.map((x) => (typeof x === "string" ? x : x.title || x.name || "?")).join(", ");
      details.push({ name, severity: v.severity, range: v.range, via: viaList, fixAvailable: v.fix_available });
    }
  }
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  console.log(`\n## 安全审计结果 — ${timestamp()}\n`);
  console.log(`| 严重级别 | 数量 |`);
  console.log(`|---------|------|`);
  console.log(`| 💀 Critical | ${summary.critical} |`);
  console.log(`| 🔴 High     | ${summary.high} |`);
  console.log(`| 🟡 Moderate | ${summary.moderate} |`);
  console.log(`| 🟢 Low      | ${summary.low} |`);
  console.log();
  if (total === 0) {
    console.log("✅ 未发现已知漏洞。");
  } else {
    console.log(`⚠️  发现 ${total} 个漏洞：\n`);
    const sevOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    details.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9));
    const headers = ["包名", "严重级别", "影响范围", "漏洞来源", "可修复"];
    const rows = details.map((d) => [
      d.name, d.severity.toUpperCase(), d.range, d.via.substring(0, 50), d.fixAvailable ? "✅" : "❌",
    ]);
    console.log(toTable(headers, rows));
    console.log(`\n### 修复建议`);
    console.log(`- \`npm audit fix\` — 自动修复兼容的漏洞`);
    console.log(`- \`npm audit fix --force\` — 强制修复（可能包含破坏性变更）`);
  }
}

// ─── Main ───────────────────────────────────────────────────────

function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0 || rawArgs[0] === "help" || rawArgs[0] === "--help" || rawArgs[0] === "-h") {
    // Delegate to help.mjs
    const helpPath = join(dirname(new URL(import.meta.url).pathname), "help.mjs");
    spawnSync("node", [helpPath], { stdio: "inherit" });
    process.exit(0);
  }

  checkNpm();
  const command = rawArgs[0];
  const rest = rawArgs.slice(1);
  const args = parseArgs(rest);

  switch (command) {
    case "search":    cmdSearch(args._[0], args); break;
    case "install":   cmdInstall(args._[0], args); break;
    case "update":    cmdUpdate(args._[0], args); break;
    case "list":      cmdList(args); break;
    case "info":      cmdInfo(args._[0], args); break;
    case "uninstall": cmdUninstall(args._[0], args); break;
    case "publish":   cmdPublish(args._[0], args); break;
    case "npx":       cmdNpx(args._[0], args); break;
    case "audit":     cmdAudit(args); break;
    default:
      console.error(`❌ 未知子命令: ${command}`);
      console.error("   可用命令: search, install, update, list, info, uninstall, publish, npx, audit");
      console.error("   查看帮助: rui-npm --help");
      process.exit(1);
  }
}

main();
