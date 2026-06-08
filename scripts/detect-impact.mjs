#!/usr/bin/env node
/**
 * detect-impact.mjs — 依赖变更影响检测
 *
 * 检测项目依赖变更（新增/删除/修改）的影响范围。
 * 分析技能、Agent、规则之间的依赖关系，输出受影响模块清单。
 * 用法: node scripts/detect-impact.mjs [--json] [--since <commit>] [file...]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-arch/场景-4-依赖变更影响/
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_MODE = process.argv.includes('--json');

// ── Dependency graph ──────────────────────────────────────────────────
// Maps files → which modules depend on them
const IMPACT_RULES = [
  { pattern: /^skills\/(rui)\//, affects: ['skills/*/SKILL.md', 'agents/*.md', 'rules/*.md', 'CLAUDE.md'] },
  { pattern: /^skills\/(rui-story)\//, affects: ['skills/rui/SKILL.md', 'tests/skills/rui.test.mjs'] },
  { pattern: /^skills\/(rui-claude)\//, affects: ['.claude/', 'CLAUDE.md'] },
  { pattern: /^skills\/(rui-import)\//, affects: ['skills/rui/SKILL.md'] },
  { pattern: /^skills\/(rui-bot)\//, affects: ['skills/rui/SKILL.md', 'skills/rui-story/'] },
  { pattern: /^skills\/(rui-npm)\//, affects: ['tests/skills/rui-npm.test.mjs'] },
  { pattern: /^skills\/(rui-trends)\//, affects: ['skills/rui/SKILL.md'] },
  { pattern: /^agents\//, affects: ['CLAUDE.md', 'skills/rui/SKILL.md', 'skills/*/SKILL.md'] },
  { pattern: /^rules\//, affects: ['CLAUDE.md', 'skills/rui/SKILL.md', 'agents/*.md'] },
  { pattern: /^lib\//, affects: ['skills/*/*.mjs', 'scripts/*.mjs', 'tests/*/*.test.mjs'] },
  { pattern: /^cdn\//, affects: ['docs/故事任务面板/*/场景-*/*.html'] },
  { pattern: /^templates\//, affects: ['docs/故事任务面板/'] },
  { pattern: /^tests\/lib\//, affects: ['tests/*/*.test.mjs'] },
];

// ── Resolve glob-like patterns to actual files ────────────────────────
function resolveAffected(pattern) {
  const results = [];
  const parts = pattern.split('/');
  function walk(dir, depth) {
    if (depth >= parts.length) return;
    const part = parts[depth];
    const fullDir = join(ROOT, ...parts.slice(0, depth + 1));
    if (part === '*') {
      if (existsSync(join(ROOT, ...parts.slice(0, depth)))) {
        const base = join(ROOT, ...parts.slice(0, depth));
        const entries = readdirSync(base).filter(e => !e.startsWith('.'));
        for (const entry of entries) {
          const newParts = [...parts.slice(0, depth), entry, ...parts.slice(depth + 1)];
          const testPath = join(ROOT, ...newParts);
          if (newParts.length === parts.length) {
            if (existsSync(testPath)) results.push(relative(ROOT, testPath));
          } else {
            walk(testPath, depth + 1);
          }
        }
      }
    } else {
      if (depth === parts.length - 1) {
        if (existsSync(fullDir)) results.push(relative(ROOT, fullDir));
      } else if (existsSync(fullDir) && statSync(fullDir).isDirectory()) {
        walk(fullDir, depth + 1);
      }
    }
  }
  walk(ROOT, 0);
  return results;
}

// ── Get changed files ─────────────────────────────────────────────────
function getChangedFiles(since) {
  try {
    const cmd = since ? `git diff --name-only ${since} HEAD` : 'git diff --name-only HEAD~1';
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim();
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// ── Analyze impact ────────────────────────────────────────────────────
function analyzeImpact(changedFiles) {
  const affected = new Map();

  for (const file of changedFiles) {
    const relFile = file.startsWith('/') ? file : file;
    for (const rule of IMPACT_RULES) {
      if (rule.pattern.test(relFile)) {
        for (const pattern of rule.affects) {
          const aff = resolveAffected(pattern);
          for (const a of aff) {
            if (!affected.has(a)) affected.set(a, []);
            affected.get(a).push(relFile);
          }
        }
      }
    }
  }

  return affected;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const files = process.argv.filter(a => !a.startsWith('--') && a !== process.argv[1]);
  const sinceIdx = process.argv.indexOf('--since');
  const since = sinceIdx >= 0 ? process.argv[sinceIdx + 1] : null;
  const changedFiles = files.length > 0 ? files : getChangedFiles(since);

  if (changedFiles.length === 0) {
    console.log('No changed files detected. Specify files or provide --since <commit>.');
    return 0;
  }

  const affected = analyzeImpact(changedFiles);

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      changedFiles,
      affectedModules: [...affected.keys()],
      details: Object.fromEntries(affected),
    }));
  } else {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  YrY 依赖变更影响检测                     ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log(`  变更文件: ${changedFiles.length}\n`);

    if (affected.size === 0) {
      console.log('  ✅ 未检测到需要关注的影响范围\n');
    } else {
      console.log(`  🔍 受影响模块: ${affected.size}\n`);
      for (const [module, causes] of affected) {
        console.log(`  📦 ${module}`);
        console.log(`     ← ${causes.join(', ')}`);
      }
    }
  }

  return 0;
}

process.exit(main());
