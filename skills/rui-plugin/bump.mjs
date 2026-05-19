#!/usr/bin/env node
/**
 * Atomic version bumper — updates version across all declared sources.
 * Usage: node bump.mjs <new-version>
 *
 * Exit: 0 = success, 1 = invalid format, 2 = dirty state, 3 = write failure
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(__dirname, 'version-sources.json');
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

function fail(code, reason) {
  console.error(`[bump] ${reason}`);
  process.exit(code);
}

function checkCleanSync() {
  try {
    const result = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf-8' });
    return result.stdout.trim() === '';
  } catch {
    return true;
  }
}

function resolveField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const arrMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrMatch) {
      current = current[arrMatch[1]];
      if (!Array.isArray(current)) return undefined;
      current = current[parseInt(arrMatch[2], 10)];
    } else {
      current = current[part];
    }
    if (current === undefined || current === null) return undefined;
  }
  return { parent: current, key: parts[parts.length - 1] };
}

function getCurrentVersion(source) {
  const filePath = path.join(ROOT, source.file);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');

  if (source.field.startsWith('regex:')) {
    const pattern = source.field.slice(6);
    const re = new RegExp(pattern, 'm');
    const match = raw.match(re);
    return match ? match[1] : null;
  }

  try {
    const obj = JSON.parse(raw);
    const resolved = resolveField(obj, source.field);
    return resolved ? String(resolved.parent[resolved.key]) : null;
  } catch {
    return null;
  }
}

function bumpSource(source, oldVer, newVer) {
  const filePath = path.join(ROOT, source.file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  let updated;

  if (source.field.startsWith('regex:')) {
    const pattern = source.field.slice(6);
    const re = new RegExp(pattern, 'm');
    if (!re.test(raw)) {
      throw new Error(`regex no match in ${source.file}`);
    }
    updated = raw.replace(re, (match, g1) => match.replace(g1, newVer));
  } else {
    const obj = JSON.parse(raw);
    const resolved = resolveField(obj, source.field);
    if (!resolved || String(resolved.parent[resolved.key]) !== oldVer) {
      throw new Error(`version mismatch in ${source.file}: expected ${oldVer}, got ${resolved?.parent[resolved.key]}`);
    }
    resolved.parent[resolved.key] = newVer;
    updated = JSON.stringify(obj, null, 2) + '\n';
  }

  const tmpPath = filePath + '.bump-tmp';
  fs.writeFileSync(tmpPath, updated, 'utf-8');
  return { filePath, tmpPath };
}

function main() {
  const newVer = process.argv[2];
  if (!newVer) {
    fail(1, 'usage: node bump.mjs <version>');
  }
  if (!SEMVER_RE.test(newVer)) {
    fail(1, `invalid version format "${newVer}" — expected x.y.z (e.g. 1.4.0)`);
  }

  if (!checkCleanSync()) {
    fail(2, 'working directory has uncommitted changes — please commit or stash before bumping');
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    fail(3, `config not found: ${CONFIG_PATH}`);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const currentVersions = config.sources.map(s => ({ source: s, version: getCurrentVersion(s) }));
  const missing = currentVersions.filter(v => v.version === null);

  if (missing.length > 0) {
    fail(3, `cannot determine current version for: ${missing.map(m => m.source.label).join(', ')}`);
  }

  const oldVer = currentVersions[0].version;
  const allSame = currentVersions.every(v => v.version === oldVer);

  if (!allSame) {
    fail(3, 'current versions are not consistent — run validate first to fix');
  }

  if (oldVer === newVer) {
    console.log(`Already at version ${newVer}, nothing to do.`);
    process.exit(0);
  }

  const temps = [];
  try {
    for (const { source } of currentVersions) {
      const { filePath, tmpPath } = bumpSource(source, oldVer, newVer);
      temps.push({ filePath, tmpPath });
    }

    for (const { filePath, tmpPath } of temps) {
      fs.renameSync(tmpPath, filePath);
    }

    console.log(`Bumped ${oldVer} → ${newVer}`);
    console.log('Updated files:');
    for (const { filePath } of temps) {
      console.log(`  ${path.relative(ROOT, filePath)}`);
    }
    console.log(`\nRun "node skills/rui-plugin/validate.mjs" to verify.`);
  } catch (e) {
    for (const { tmpPath } of temps) {
      try { fs.unlinkSync(tmpPath); } catch {}
    }
    fail(3, `bump failed: ${e.message}`);
  }
}

main();
