/**
 * rui-npm tools — npx execution, audit, and CDN lookup
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { spawnSync } from "node:child_process";
import { npm, checkPackageJson, toTable, timestamp } from "./npm-utils.mjs";

export function cmdNpx(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm npx <pkg>[@version]");
    console.error("   Example: rui-npm npx create-react-app -- my-app");
    process.exit(1);
  }
  const npxArgs = ["--yes", pkg, ...args.npxArgs];
  console.log(`▶️  npx ${pkg}${args.npxArgs.length ? " " + args.npxArgs.join(" ") : ""}`);
  const result = spawnSync("npx", npxArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.error) {
    console.error(`❌ npx execution failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ npx execution returned exit code ${result.status}`);
    process.exit(result.status);
  }
}

export function cmdAudit(/** @type {any} */ args) {
  checkPackageJson();
  console.log("🔒 Auditing dependency security vulnerabilities ...");
  const r = npm(["audit", "--json"]);
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    try { data = JSON.parse(r.stdout || r.stderr || "{}"); } catch {
      console.error("❌ Security audit failed. npm registry may be unreachable.");
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
  console.log(`\n## Security Audit Results — ${timestamp()}\n`);
  console.log(`| Severity | Count |`);
  console.log(`|---------|------|`);
  console.log(`| 💀 Critical | ${summary.critical} |`);
  console.log(`| 🔴 High     | ${summary.high} |`);
  console.log(`| 🟡 Moderate | ${summary.moderate} |`);
  console.log(`| 🟢 Low      | ${summary.low} |`);
  console.log();
  if (total === 0) {
    console.log("✅ No known vulnerabilities found.");
  } else {
    console.log(`⚠️  Found ${total} vulnerabilities:\n`);
    /** @type {Record<string, number>} */
    const sevOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    details.sort((a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9));
    const headers = ["Package Name", "Severity", "Affected Range", "Vulnerability Source", "Fixable"];
    const rows = details.map((d) => [
      d.name, d.severity.toUpperCase(), d.range, d.via.substring(0, 50), d.fixAvailable ? "✅" : "❌",
    ]);
    console.log(toTable(headers, rows));
    console.log(`\n### Fix Recommendations`);
    console.log(`- \`npm audit fix\` — auto-fix compatible vulnerabilities`);
    console.log(`- \`npm audit fix --force\` — force fix (may include breaking changes)`);
  }
}

export function cmdCdn(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm cdn <pkg>[@version]");
    console.error("   Example: rui-npm cdn react");
    console.error("   Example: rui-npm cdn react@18.2.0");
    process.exit(1);
  }
  const atIdx = pkg.lastIndexOf("@");
  const pkgName = atIdx > 0 ? pkg.substring(0, atIdx) : pkg;
  const version = atIdx > 0 ? pkg.substring(atIdx + 1) : null;

  console.log(`📡 Querying ${pkg} CDN reference URLs ...`);
  const r = npm(["view", pkgName, "version"]);
  if (r.status !== 0) {
    console.error(`❌ Package "${pkgName}" does not exist in npm registry.`);
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

  console.log(`\n## ${pkgName}@${ver} — CDN Reference URLs\n`);
  console.log(`| CDN | URL |`);
  console.log(`|-----|-----|`);
  console.log(`| unpkg    | ${urls.unpkg} |`);
  console.log(`| jsDelivr | ${urls.jsDelivr} |`);
  console.log(`| esm.sh   | ${urls.esm} |`);
  console.log();
}