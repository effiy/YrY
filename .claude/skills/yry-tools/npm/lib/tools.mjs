/**
 * rui-npm tools — npx execution, audit, and CDN lookup
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { spawnSync } from "node:child_process";
import { npm, checkPackageJson, toTable, timestamp } from "./npm-utils.mjs";

export function cmdNpx(/** @type {string} */ pkg, /** @type {any} */ args) {
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

export function cmdAudit(/** @type {any} */ args) {
  checkPackageJson();
  console.log("🔒 审计依赖安全漏洞 ...");
  const r = npm(["audit", "--json"]);
  let data;
  try { data = JSON.parse(r.stdout); } catch {
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
  /** @type {Record<string, number>} */
  const summary = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
  const details = [];
  for (const [name, v] of Object.entries(vulns)) {
    summary[v.severity] = (summary[v.severity] || 0) + 1;
    if (v.via?.length) {
      const viaList = v.via.map((/** @type {any} */ x) => (typeof x === "string" ? x : x.title || x.name || "?")).join(", ");
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
    /** @type {Record<string, number>} */
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

export function cmdCdn(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm cdn <pkg>[@version]");
    console.error("   示例: rui-npm cdn react");
    console.error("   示例: rui-npm cdn react@18.2.0");
    process.exit(1);
  }
  const atIdx = pkg.lastIndexOf("@");
  const pkgName = atIdx > 0 ? pkg.substring(0, atIdx) : pkg;
  const version = atIdx > 0 ? pkg.substring(atIdx + 1) : null;

  console.log(`📡 查询 ${pkg} CDN 引用地址 ...`);
  const r = npm(["view", pkgName, "version"]);
  if (r.status !== 0) {
    console.error(`❌ 包 "${pkgName}" 在 npm registry 中不存在。`);
    process.exit(1);
  }
  const latestVersion = r.stdout.trim();
  const ver = version || latestVersion;

  const urls = {
    package: pkgName,
    version: ver,
    unpkg: `https://unpkg.com/${pkgName}@${ver}/`,
    jsDelivr: `https://cdn.jsdelivr.net/npm/${pkgName}@${ver}/`,
    esm: `https://esm.sh/${pkgName}@${ver}`,
  };

  if (args.json) {
    console.log(JSON.stringify(urls, null, 2));
    return;
  }

  console.log(`\n## ${pkgName}@${ver} — CDN 引用地址\n`);
  console.log(`| CDN | URL |`);
  console.log(`|-----|-----|`);
  console.log(`| unpkg    | ${urls.unpkg} |`);
  console.log(`| jsDelivr | ${urls.jsDelivr} |`);
  console.log(`| esm.sh   | ${urls.esm} |`);
  console.log();
}
