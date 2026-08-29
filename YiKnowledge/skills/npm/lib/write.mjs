/**
 * rui-npm write — install/update/uninstall subcommands
 * Extracted from rui-npm.mjs for single-responsibility
 */

import { spawnSync } from "node:child_process";
import { npm, checkPackageJson } from "./npm-utils.mjs";

export function cmdInstall(/** @type {string} */ pkg, /** @type {any} */ args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm install <pkg>[@version]");
    console.error("   Example: rui-npm install lodash@4.17.21");
    process.exit(1);
  }
  if (!args.global) checkPackageJson();
  const npmArgs = ["install"];
  if (args.global) npmArgs.push("-g");
  if (args.dev) npmArgs.push("--save-dev");
  else if (!args.global) npmArgs.push("--save");
  npmArgs.push(pkg);
  console.log(`📦 Installing ${pkg} ...`);
  const result = spawnSync("npm", npmArgs, { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ Install failed (exit code ${result.status}). Please check if package name is correct.`);
    console.error(`   Try: /rui-npm search ${pkg.split("@")[0]}`);
    process.exit(result.status);
  }
  const pkgName = pkg.split("@")[0];
  const info = npm(["list", pkgName, "--json", "--depth", "0"]);
  try {
    const parsed = JSON.parse(info.stdout);
    const version = parsed?.dependencies?.[pkgName]?.version ?? "?";
    console.log(`✅ ${pkgName}@${version} installation complete`);
  } catch {
    console.log(`✅ ${pkg} installation complete`);
  }
}

export function cmdUpdate(/** @type {string} */ pkg, /** @type {any} */ _args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm update <pkg>");
    process.exit(1);
  }
  checkPackageJson();
  const before = npm(["list", pkg, "--json", "--depth", "0"]);
  let beforeVer = "?";
  try { beforeVer = JSON.parse(before.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch { /* parse failed, keep "?" */ }
  console.log(`⬆️  Updating ${pkg} (current: ${beforeVer}) ...`);
  const result = spawnSync("npm", ["update", pkg], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ Update failed (exit code ${result.status}).`);
    process.exit(result.status);
  }
  const after = npm(["list", pkg, "--json", "--depth", "0"]);
  let afterVer = "?";
  try { afterVer = JSON.parse(after.stdout)?.dependencies?.[pkg]?.version ?? "?"; } catch { /* parse failed, keep "?" */ }
  if (beforeVer !== afterVer) {
    console.log(`✅ ${pkg}: ${beforeVer} → ${afterVer}`);
  } else {
    console.log(`✅ ${pkg}@${afterVer} is already the latest compatible version`);
  }
}

export function cmdUninstall(/** @type {string} */ pkg, /** @type {any} */ _args) {
  if (!pkg) {
    console.error("❌ Please provide package name. Usage: rui-npm uninstall <pkg>");
    process.exit(1);
  }
  checkPackageJson();
  console.log(`🗑️  Uninstalling ${pkg} ...`);
  const result = spawnSync("npm", ["uninstall", pkg], { stdio: "inherit", encoding: "utf-8" });
  if (result.status !== 0) {
    console.error(`❌ Uninstall failed (exit code ${result.status}). Please confirm package "${pkg}" is installed.`);
    process.exit(result.status);
  }
  console.log(`✅ ${pkg} uninstalled`);
}