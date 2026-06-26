#!/usr/bin/env node
/**
 * bump-version.mjs — 版本号 bump + CHANGELOG.md 节拆分
 *
 * Usage:
 *   node scripts/bump-version.mjs <new-version>     # e.g. 5.4.1
 *   node scripts/bump-version.mjs patch             # 5.4.0 → 5.4.1
 *   node scripts/bump-version.mjs minor             # 5.4.0 → 5.5.0
 *   node scripts/bump-version.mjs major             # 5.4.0 → 6.0.0
 *
 * 行为：
 *   1. 读取 package.json 当前版本号
 *   2. 计算新版本号（或用参数）
 *   3. 更新 package.json version 字段
 *   4. 把 CHANGELOG.md 的 [Unreleased] 节拆出 [new-version] 节
 *   5. 打印后续 git 命令（不自动执行）
 *
 * 不碰 git — 用户手动执行 git commit + tag。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PKG_PATH = resolve(ROOT, 'package.json');
const CHANGELOG_PATH = resolve(ROOT, 'CHANGELOG.md');

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function bumpVersion(current, kind) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`;
  return null;
}

function isValidVersion(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
}

function updateChangelog(changelog, newVersion) {
  const today = new Date().toISOString().slice(0, 10);
  const unreleasedHeader = '## [Unreleased]';
  const newVersionHeader = `## [${newVersion}] — ${today}`;

  if (!changelog.includes(unreleasedHeader)) {
    throw new Error(`CHANGELOG.md 缺少 "${unreleasedHeader}" 节`);
  }

  const lines = changelog.split('\n');
  const unreleasedIdx = lines.findIndex(l => l.startsWith(unreleasedHeader));
  const nextHeaderIdx = lines.findIndex((l, i) => i > unreleasedIdx && /^## \[/.test(l));

  const unreleasedBody = nextHeaderIdx === -1
    ? lines.slice(unreleasedIdx + 1).join('\n')
    : lines.slice(unreleasedIdx + 1, nextHeaderIdx).join('\n');

  const beforeUnreleased = lines.slice(0, unreleasedIdx).join('\n');
  const afterUnreleased = nextHeaderIdx === -1
    ? ''
    : lines.slice(nextHeaderIdx).join('\n');

  const newSection = [
    beforeUnreleased,
    `${unreleasedHeader}\n`,
    `_(待下一轮 /loop 或 PR 追加条目)_`,
    '',
    `${newVersionHeader}`,
    unreleasedBody.trimEnd(),
    '',
    afterUnreleased,
  ].filter(Boolean).join('\n');

  return newSection.replace(/\n{3,}/g, '\n\n\n').trimEnd() + '\n';
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/bump-version.mjs <new-version|patch|minor|major>');
    process.exit(1);
  }

  const pkg = readJSON(PKG_PATH);
  const current = pkg.version;

  let newVersion;
  if (isValidVersion(arg)) {
    newVersion = arg;
  } else {
    newVersion = bumpVersion(current, arg);
  }

  if (!newVersion || !isValidVersion(newVersion)) {
    console.error(`Invalid version: ${arg} (current: ${current})`);
    process.exit(1);
  }

  if (newVersion === current) {
    console.error(`Version unchanged: ${current} → ${newVersion}`);
    process.exit(1);
  }

  console.log(`Bumping version: ${current} → ${newVersion}`);

  pkg.version = newVersion;
  writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✓ package.json updated`);

  let changelog;
  try {
    changelog = readFileSync(CHANGELOG_PATH, 'utf8');
  } catch {
    console.warn(`! CHANGELOG.md not found at ${CHANGELOG_PATH} — skipping changelog update`);
    return;
  }

  const newChangelog = updateChangelog(changelog, newVersion);
  writeFileSync(CHANGELOG_PATH, newChangelog);
  console.log(`✓ CHANGELOG.md updated (new section: [${newVersion}])`);

  console.log('\n后续命令（手动执行）:');
  console.log(`  git add package.json CHANGELOG.md`);
  console.log(`  git commit -m "chore: release v${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push && git push --tags`);
}

main();
