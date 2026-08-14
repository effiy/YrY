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
    console.error(`❌ Package "${pkgName}" does not exist in npm registry.`);
    console.error(`   Try: /rui-npm search ${pkgName}`);
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
      console.error(`❌ You are not the owner of package "${pkgName}". Only the package owner can perform this operation.`);
      console.error(`   Currently logged in user: ${username}`);
      console.error(`   Package maintainers: ${JSON.stringify(maintainers)}`);
      process.exit(1);
    }
  } catch {
    console.error("❌ Cannot verify package ownership. Please check network connection.");
    process.exit(1);
  }
}

export function cmdPublish(/** @type {string} */ path, /** @type {any} */ args) {
  if (!path) {
    console.error("❌ Please provide file or directory path. Usage: rui-npm publish <path>");
    console.error("   Example: rui-npm publish ./my-script.js --name my-util");
    process.exit(1);
  }
  const absPath = resolve(path);
  if (!existsSync(absPath)) {
    console.error(`❌ Path does not exist: ${absPath}`);
    process.exit(1);
  }
  const isDir = statSync(absPath).isDirectory();
  const npmUser = checkNpmLogin();
  console.log(`👤 Logged into npm: ${npmUser}`);

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
    console.log(`📝 Auto-generating package.json (name: ${pkgName}) ...`);
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
      console.log(`📝 Using existing package.json: ${pkgName}@${pkgVersion}`);
    } catch {
      console.error("❌ Invalid package.json format, please fix and retry.");
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

  console.log(`🔍 Checking registry for existing package with same name "${pkgName}" ...`);
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
      console.error(`❌ npm registry already has package "${pkgName}" (${check.stdout.trim()}), and you are not a maintainer.`);
      console.error(`   Please use --name to specify a different package name, or contact the maintainer.`);
      if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
      process.exit(1);
    }
    console.log(`   ✅ You are a maintainer, allowed to publish new version (current: ${check.stdout.trim()})`);
  }

  const npmArgs = ["publish", ...registryArgs()];
  if (args.access) npmArgs.push("--access", args.access);
  if (args.dryRun) npmArgs.push("--dry-run");
  console.log(args.dryRun ? "🧪 Dry-run publish (--dry-run) ..." : "🚀 Publishing ...");
  const result = spawnSync("npm", npmArgs, { cwd: publishDir, stdio: "inherit", encoding: "utf-8" });

  if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });

  if (result.status !== 0) {
    console.error(`❌ Publish failed (exit code ${result.status}).`);
    process.exit(result.status);
  }
  if (!args.dryRun) {
    console.log(`✅ ${pkgName}@${pkgVersion} published successfully`);
    console.log(`   Install: npm install ${pkgName}`);
    console.log(`   Run: npx ${pkgName}`);
  }
}