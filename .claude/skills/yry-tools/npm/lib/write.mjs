/**
 * rui-npm write — install/update/uninstall subcommands
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { spawnSync } from "node:child_process";
import { npm, checkPackageJson } from "./npm-utils.mjs";

export function cmdInstall(/** @type {string} */ pkg, /** @type {any} */ args) {
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

export function cmdUpdate(/** @type {string} */ pkg, /** @type {any} */ _args) {
  if (!pkg) {
    console.error("❌ 请提供包名。用法: rui-npm update <pkg>");
    process.exit(1);
  }
  checkPackageJson();
  const before = npm(["list", pkg, "--json", "--depth", "0"]);
  let beforeVer = "?";
  try { beforeVer = JSON.parse(before.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch { /* parse failed, keep "?" */ }
  console.log(`⬆️  更新 ${pkg} (当前: ${beforeVer}) ...`);
  const result = spawnSync("npm", ["update", pkg], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ 更新失败（退出码 ${result.status}）。`);
    process.exit(result.status);
  }
  const after = npm(["list", pkg, "--json", "--depth", "0"]);
  let afterVer = "?";
  try { afterVer = JSON.parse(after.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch { /* parse failed, keep "?" */ }
  if (beforeVer !== afterVer) {
    console.log(`✅ ${pkg}: ${beforeVer} → ${afterVer}`);
  } else {
    console.log(`✅ ${pkg}@${afterVer} 已是最新兼容版本`);
  }
}

export function cmdUninstall(/** @type {string} */ pkg, /** @type {any} */ _args) {
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
