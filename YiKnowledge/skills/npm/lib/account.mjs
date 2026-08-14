/**
 * rui-npm account — account-level operations (my-packages, deprecate, unpublish)
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { spawnSync } from "node:child_process";
import { npm, registryArgs, toTable, timestamp, httpGetJson } from "./npm-utils.mjs";
import { checkNpmLogin } from "./auth.mjs";
import { verifyOwnership } from "./publish.mjs";

export async function cmdMyPackages(/** @type {any} */ args) {
  const npmUser = checkNpmLogin();
  console.log(`📦 Querying ${npmUser}'s npm packages ...`);

  let packages = [];

  try {
    const searchUrl = `/-/v1/search?text=maintainer:${encodeURIComponent(npmUser)}&size=${Math.min(args.limit || 100, 250)}`;
    const result = await httpGetJson(`https://registry.npmjs.org${searchUrl}`);
    packages = (result.objects || []).map((/** @type {any} */ o) => o.package || o);
  } catch {
    console.log("   registry search API unreachable, trying npm access ls-packages ...");
    const r = npm(["access", "ls-packages", ...registryArgs()]);
    if (r.status === 0 && r.stdout) {
      try {
        const data = JSON.parse(r.stdout);
        packages = Object.entries(data || {}).map(([name]) => ({ name }));
      } catch {
        // can't parse
      }
    }
    if (!packages.length) {
      console.error("❌ Cannot get package list. npm registry may be unreachable.");
      console.error(`   Manual access: https://www.npmjs.com/~${encodeURIComponent(npmUser)}`);
      process.exit(1);
    }
  }

  if (!packages.length) {
    console.log(`User ${npmUser} has no published npm packages.`);
    return;
  }

  const enriched = [];
  for (const p of packages) {
    const name = p.name;
    const description = p.description || "";
    const version = p.version || "?";
    const downloads = p.downloads?.weekly || p.downloads?.monthly || 0;
    enriched.push({ name, description, version, downloads });
  }

  enriched.sort((a, b) => b.downloads - a.downloads);

  const top = enriched.slice(0, args.limit || 100);

  if (args.json) {
    console.log(JSON.stringify(top, null, 2));
    return;
  }

  console.log(`\n## ${npmUser}'s npm packages (${enriched.length}) — ${timestamp()}\n`);
  const headers = ["#", "Package Name", "Version", "Weekly Downloads", "Description"];
  const rows = top.map((p, i) => [
    i + 1,
    p.name,
    p.version,
    p.downloads ? `${(p.downloads / 1000).toFixed(1)}k/w` : "?",
    (p.description || "").substring(0, 60),
  ]);
  console.log(toTable(headers, rows));
  if (enriched.length > top.length) {
    console.log(`\n> Total ${enriched.length} packages, showing top ${top.length}. Use --limit to adjust count.`);
  }
}

export function cmdDeprecate(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name and deprecation message. Usage: rui-npm deprecate <pkg>[@version] \"<message>\"");
    console.error("   Example: rui-npm deprecate my-util@1.0.0 \"Use 2.0.0 instead\"");
    console.error("   Example: rui-npm deprecate my-util \"This package is no longer maintained\"");
    process.exit(1);
  }

  const pkgName = pkg.split("@")[0];
  const pkgVersion = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(pkg.lastIndexOf("@") + 1) : null;

  const pkgIdx = args._.indexOf(pkg);
  const messageParts = args._.slice(pkgIdx + 1);
  const message = messageParts.join(" ");

  if (!message) {
    console.error("❌ Please provide deprecation message. Usage: rui-npm deprecate <pkg>[@version] \"<message>\"");
    console.error("   Example: rui-npm deprecate my-util@1.0.0 \"Use 2.0.0 instead\"");
    process.exit(1);
  }

  const npmUser = checkNpmLogin();
  console.log(`👤 Logged into npm: ${npmUser}`);

  verifyOwnership(npmUser, pkgName);

  const target = pkgVersion ? `${pkgName}@${pkgVersion}` : pkgName;
  console.log(`⚠️  Deprecating ${target} ...`);
  console.log(`   Message: ${message}`);

  const result = spawnSync("npm", ["deprecate", target, message, ...registryArgs()], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ Deprecation failed (exit code ${result.status}).`);
    process.exit(result.status);
  }
  console.log(`✅ ${target} marked as deprecated`);
  if (pkgVersion) {
    console.log(`   View: https://www.npmjs.com/package/${pkgName}/v/${pkgVersion}`);
  } else {
    console.log(`   View: https://www.npmjs.com/package/${pkgName}`);
  }
}

export function cmdUnpublish(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm unpublish <pkg>[@version] [--force]");
    console.error("   Example: rui-npm unpublish my-util@1.0.0");
    console.error("   Example: rui-npm unpublish my-util --force");
    process.exit(1);
  }

  const pkgName = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(0, pkg.lastIndexOf("@")) : pkg;
  const pkgVersion = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(pkg.lastIndexOf("@") + 1) : null;
  const force = args.force || args.raw.includes("--force") || args.raw.includes("-f");

  const npmUser = checkNpmLogin();
  console.log(`👤 Logged into npm: ${npmUser}`);

  verifyOwnership(npmUser, pkgName);

  const info = npm(["view", pkgName, "--json", ...registryArgs()]);
  /** @type {any} */
  let pkgData = {};
  try { pkgData = JSON.parse(info.stdout); } catch { /* parse failed, keep {} */ }
  if (Array.isArray(pkgData)) pkgData = pkgData[pkgData.length - 1];

  const target = pkgVersion ? `${pkgName}@${pkgVersion}` : pkgName;
  console.log();
  console.log("⚠️  ═══════════════════════════════════════");
  console.log(`⚠️  About to delete from npm registry: ${target}`);
  if (pkgData.versions) {
    const versions = Array.isArray(pkgData.versions) ? pkgData.versions : Object.keys(pkgData.versions);
    console.log(`⚠️  Package existing version count: ${versions.length}`);
    if (!pkgVersion && versions.length > 1) {
      console.log(`⚠️  Will delete all ${versions.length} versions!`);
    }
  }
  console.log("⚠️  ");
  console.log("⚠️  Notes:");
  console.log("⚠️  - Within 72 hours of deletion, contact npm support for recovery");
  console.log("⚠️  - Deletion of versions older than 72 hours may be rejected (requires --force)");
  console.log("⚠️  - After deletion, the package name may be registered by others");
  console.log("⚠️  - npm officially recommends using deprecate over unpublish");
  console.log("⚠️  ═══════════════════════════════════════");
  console.log();

  if (pkgVersion) {
    console.log(`🗑️  Deleting version ${target} ...`);
  } else {
    console.log(`🗑️  Deleting package ${target} (all versions)...`);
  }

  const unpublishArgs = ["unpublish", target, ...registryArgs()];
  if (force) unpublishArgs.push("--force");

  const result = spawnSync("npm", unpublishArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ Deletion failed (exit code ${result.status}).`);
    if (!force) {
      console.error("   Tip: packages older than 72 hours require --force flag.");
    }
    process.exit(result.status);
  }
  console.log(`✅ ${target} deleted from npm registry`);
  console.log("   ℹ️  Contact npm support for recovery within 72 hours: https://www.npmjs.com/support");
}