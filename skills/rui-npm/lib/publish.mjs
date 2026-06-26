/**
 * publish.mjs — npm package publishing operations
 *
 * Extracted from rui-npm.mjs for single-responsibility.
 * Handles: publish, verifyOwnership.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, cpSync, rmSync } from "node:fs";
import { join, resolve, basename, extname } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

import { npm, registryArgs } from './npm-utils.mjs';
import { checkNpmLogin } from './auth.mjs';

export function verifyOwnership(/** @type {string} */ username, /** @type {string} */ pkgName) {
  const r = npm(["view", pkgName, "maintainers", "--json", ...registryArgs()]);
  if (r.status !== 0) {
    console.error(`❌ 包 "${pkgName}" 在 npm registry 中不存在。`);
    console.error(`   可尝试: /rui-npm search ${pkgName}`);
    process.exit(1);
  }
  try {
    const maintainers = JSON.parse(r.stdout);
    const isOwner = Array.isArray(maintainers) && maintainers.some(
      (/** @type {any} */ m) => {
        const name = typeof m === "string" ? m.split(" ")[0] : m.name;
        return name === username;
      }
    );
    if (!isOwner) {
      console.error(`❌ 你不是包 "${pkgName}" 的所有者。只有包的所有者才能执行此操作。`);
      console.error(`   当前登录用户: ${username}`);
      console.error(`   包维护者: ${JSON.stringify(maintainers)}`);
      process.exit(1);
    }
  } catch {
    console.error("❌ 无法验证包所有权。请检查网络连接。");
    process.exit(1);
  }
}

export function cmdPublish(/** @type {string} */ path, /** @type {any} */ args) {
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

  if (!isDir) {
    tmpDir = join(tmpdir(), `rui-npm-${randomBytes(6).toString("hex")}`);
    mkdirSync(tmpDir, { recursive: true });
    const ext = basename(absPath).endsWith(".mjs") ? ".mjs" : ".js";
    const destFile = join(tmpDir, `index${ext}`);
    writeFileSync(destFile, readFileSync(absPath, "utf-8"));
    publishDir = tmpDir;
  }

  const pkgJsonPath = join(publishDir, "package.json");
  const derivedName = args.name || basename(absPath).replace(/\.[^.]+$/, "").replace(/[^a-z0-9._-]/g, "-");
  let pkgName = derivedName;
  let pkgVersion = args.version;

  if (!existsSync(pkgJsonPath)) {
    console.log(`📝 自动生成 package.json (name: ${pkgName}) ...`);
    /** @type {Record<string, any>} */
    const pkgJson = {
      name: pkgName,
      version: pkgVersion || "1.0.0",
      description: args.description || `Auto-published by rui-npm — ${basename(absPath)}`,
      main: isDir ? (existsSync(join(publishDir, "index.js")) ? "index.js" : undefined) : `index${extname(absPath)}`,
      bin: !isDir ? { [pkgName]: `./index${extname(absPath)}` } : undefined,
      license: "MIT",
    };
    for (const k of Object.keys(pkgJson)) {
      if (pkgJson[k] === undefined || pkgJson[k] === null) delete pkgJson[k];
    }
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
  } else {
    try {
      const existing = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      pkgName = args.name || existing.name || pkgName;
      pkgVersion = args.version || existing.version || pkgVersion;
      console.log(`📝 使用已有 package.json: ${pkgName}@${pkgVersion}`);
    } catch {
      console.error("❌ package.json 格式无效，请修正后重试。");
      if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
      process.exit(1);
    }
  }

  if (isDir && (args.name || args.version) && existsSync(pkgJsonPath)) {
    const origDir = publishDir;
    tmpDir = join(tmpdir(), `rui-npm-${randomBytes(6).toString("hex")}`);
    cpSync(origDir, tmpDir, { recursive: true });
    publishDir = tmpDir;
    const tmpPkgPath = join(publishDir, "package.json");
    const pkg = JSON.parse(readFileSync(tmpPkgPath, "utf-8"));
    if (args.name) pkg.name = args.name;
    if (args.version) pkg.version = args.version;
    writeFileSync(tmpPkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  console.log(`🔍 检查 registry 是否存在同名包 "${pkgName}" ...`);
  const check = npm(["view", pkgName, "version", ...registryArgs()]);
  if (check.status === 0) {
    const maintainersResult = npm(["view", pkgName, "maintainers", "--json", ...registryArgs()]);
    let isMaintainer = false;
    try {
      const maintainers = JSON.parse(maintainersResult.stdout);
      isMaintainer = Array.isArray(maintainers) && maintainers.some(
        (m) => {
          const name = typeof m === "string" ? m.split(" ")[0] : m.name;
          return name === npmUser;
        }
      );
    } catch { /* block to be safe */ }
    if (!isMaintainer) {
      console.error(`❌ npm registry 已存在包 "${pkgName}" (${check.stdout.trim()})，且你不是维护者。`);
      console.error(`   请使用 --name 指定不同的包名，或联系维护者。`);
      if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
      process.exit(1);
    }
    console.log(`   ✅ 你是维护者，允许发布新版本 (current: ${check.stdout.trim()})`);
  }

  const npmArgs = ["publish", ...registryArgs()];
  if (args.access) npmArgs.push("--access", args.access);
  if (args.dryRun) npmArgs.push("--dry-run");
  console.log(args.dryRun ? "🧪 模拟发布 (--dry-run) ..." : "🚀 发布中 ...");
  const result = spawnSync("npm", npmArgs, { cwd: publishDir, stdio: "inherit", encoding: "utf-8" });

  if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });

  if (result.status !== 0) {
    console.error(`❌ 发布失败（退出码 ${result.status}）。`);
    process.exit(result.status);
  }
  if (!args.dryRun) {
    console.log(`✅ ${pkgName}@${pkgVersion} 发布成功`);
    console.log(`   安装: npm install ${pkgName}`);
    console.log(`   运行: npx ${pkgName}`);
  }
}
