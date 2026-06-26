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
  console.log(`📦 查询 ${npmUser} 的 npm 包 ...`);

  let packages = [];

  try {
    const searchUrl = `/-/v1/search?text=maintainer:${encodeURIComponent(npmUser)}&size=${Math.min(args.limit || 100, 250)}`;
    const result = await httpGetJson(`https://registry.npmjs.org${searchUrl}`);
    packages = (result.objects || []).map((/** @type {any} */ o) => o.package || o);
  } catch {
    console.log("   registry search API 不可达，尝试 npm access ls-packages ...");
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
      console.error("❌ 无法获取包列表。npm registry 可能不可达。");
      console.error(`   手动访问: https://www.npmjs.com/~${encodeURIComponent(npmUser)}`);
      process.exit(1);
    }
  }

  if (!packages.length) {
    console.log(`用户 ${npmUser} 暂无发布的 npm 包。`);
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

  console.log(`\n## ${npmUser} 的 npm 包（${enriched.length} 个） — ${timestamp()}\n`);
  const headers = ["#", "包名", "版本", "周下载量", "描述"];
  const rows = top.map((p, i) => [
    i + 1,
    p.name,
    p.version,
    p.downloads ? `${(p.downloads / 1000).toFixed(1)}k/w` : "?",
    (p.description || "").substring(0, 60),
  ]);
  console.log(toTable(headers, rows));
  if (enriched.length > top.length) {
    console.log(`\n> 共 ${enriched.length} 个包，展示前 ${top.length} 个。使用 --limit 调整数量。`);
  }
}

export function cmdDeprecate(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ 请提供包名和废弃消息。用法: rui-npm deprecate <pkg>[@version] \"<message>\"");
    console.error("   示例: rui-npm deprecate my-util@1.0.0 \"Use 2.0.0 instead\"");
    console.error("   示例: rui-npm deprecate my-util \"This package is no longer maintained\"");
    process.exit(1);
  }

  const pkgName = pkg.split("@")[0];
  const pkgVersion = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(pkg.lastIndexOf("@") + 1) : null;

  const pkgIdx = args._.indexOf(pkg);
  const messageParts = args._.slice(pkgIdx + 1);
  const message = messageParts.join(" ");

  if (!message) {
    console.error("❌ 请提供废弃消息。用法: rui-npm deprecate <pkg>[@version] \"<message>\"");
    console.error("   示例: rui-npm deprecate my-util@1.0.0 \"Use 2.0.0 instead\"");
    process.exit(1);
  }

  const npmUser = checkNpmLogin();
  console.log(`👤 已登录 npm: ${npmUser}`);

  verifyOwnership(npmUser, pkgName);

  const target = pkgVersion ? `${pkgName}@${pkgVersion}` : pkgName;
  console.log(`⚠️  废弃 ${target} ...`);
  console.log(`   消息: ${message}`);

  const result = spawnSync("npm", ["deprecate", target, message, ...registryArgs()], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 废弃失败（退出码 ${result.status}）。`);
    process.exit(result.status);
  }
  console.log(`✅ ${target} 已标记为 deprecated`);
  if (pkgVersion) {
    console.log(`   查看: https://www.npmjs.com/package/${pkgName}/v/${pkgVersion}`);
  } else {
    console.log(`   查看: https://www.npmjs.com/package/${pkgName}`);
  }
}

export function cmdUnpublish(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm unpublish <pkg>[@version] [--force]");
    console.error("   示例: rui-npm unpublish my-util@1.0.0");
    console.error("   示例: rui-npm unpublish my-util --force");
    process.exit(1);
  }

  const pkgName = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(0, pkg.lastIndexOf("@")) : pkg;
  const pkgVersion = pkg.includes("@") && pkg.lastIndexOf("@") > 0 ? pkg.substring(pkg.lastIndexOf("@") + 1) : null;
  const force = args.force || args.raw.includes("--force") || args.raw.includes("-f");

  const npmUser = checkNpmLogin();
  console.log(`👤 已登录 npm: ${npmUser}`);

  verifyOwnership(npmUser, pkgName);

  const info = npm(["view", pkgName, "--json", ...registryArgs()]);
  /** @type {any} */
  let pkgData = {};
  try { pkgData = JSON.parse(info.stdout); } catch { /* parse failed, keep {} */ }
  if (Array.isArray(pkgData)) pkgData = pkgData[pkgData.length - 1];

  const target = pkgVersion ? `${pkgName}@${pkgVersion}` : pkgName;
  console.log();
  console.log("⚠️  ═══════════════════════════════════════");
  console.log(`⚠️  即将从 npm registry 删除: ${target}`);
  if (pkgData.versions) {
    const versions = Array.isArray(pkgData.versions) ? pkgData.versions : Object.keys(pkgData.versions);
    console.log(`⚠️  包现有版本数: ${versions.length}`);
    if (!pkgVersion && versions.length > 1) {
      console.log(`⚠️  将删除所有 ${versions.length} 个版本！`);
    }
  }
  console.log("⚠️  ");
  console.log("⚠️  注意事项:");
  console.log("⚠️  - 删除后 72 小时内可联系 npm support 恢复");
  console.log("⚠️  - 超过 72 小时的版本删除可能被拒绝（需 --force）");
  console.log("⚠️  - 删除后该包名可能被他人注册");
  console.log("⚠️  - npm 官方建议优先使用 deprecate 而非 unpublish");
  console.log("⚠️  ═══════════════════════════════════════");
  console.log();

  if (pkgVersion) {
    console.log(`🗑️  删除版本 ${target} ...`);
  } else {
    console.log(`🗑️  删除包 ${target}（所有版本）...`);
  }

  const unpublishArgs = ["unpublish", target, ...registryArgs()];
  if (force) unpublishArgs.push("--force");

  const result = spawnSync("npm", unpublishArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 删除失败（退出码 ${result.status}）。`);
    if (!force) {
      console.error("   提示：超过 72 小时的包需使用 --force 标志。");
    }
    process.exit(result.status);
  }
  console.log(`✅ ${target} 已从 npm registry 删除`);
  console.log("   ℹ️  72 小时内可联系 npm support 恢复: https://www.npmjs.com/support");
}
