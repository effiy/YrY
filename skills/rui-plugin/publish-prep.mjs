#!/usr/bin/env node
/**
 * Publish readiness check — validates all preconditions for marketplace publishing.
 *
 * Exit: 0 = ready, 1 = blocked
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED_DOCS = ['README.md', 'CLAUDE.md'];

function check(step, fn) {
  try {
    return fn();
  } catch (e) {
    return { step, ok: false, reason: e.message };
  }
}

function checkVersion() {
  const validatePath = path.join(__dirname, 'validate.mjs');
  const result = spawnSync('node', [validatePath], { cwd: ROOT, encoding: 'utf-8', timeout: 10000 });
  if (result.status === 0) {
    return { step: 'version consistency', ok: true };
  }
  return { step: 'version consistency', ok: false, reason: 'version mismatch — run validate for details' };
}

function checkPluginJson() {
  const p = path.join(ROOT, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(p)) return { step: 'plugin.json exists', ok: false, reason: 'file not found' };
  const obj = JSON.parse(fs.readFileSync(p, 'utf-8'));
  const missing = ['name', 'description', 'version', 'author', 'repository', 'keywords', 'license']
    .filter(f => !obj[f]);
  if (missing.length > 0) {
    return { step: 'plugin.json completeness', ok: false, reason: `missing fields: ${missing.join(', ')}` };
  }
  return { step: 'plugin.json completeness', ok: true };
}

function checkMarketplaceJson() {
  const p = path.join(ROOT, '.claude-plugin', 'marketplace.json');
  if (!fs.existsSync(p)) return { step: 'marketplace.json exists', ok: false, reason: 'file not found' };
  const obj = JSON.parse(fs.readFileSync(p, 'utf-8'));
  if (!obj.plugins || obj.plugins.length === 0) {
    return { step: 'marketplace.json validity', ok: false, reason: 'plugins array empty' };
  }
  return { step: 'marketplace.json validity', ok: true };
}

function checkRequiredDocs() {
  const missing = REQUIRED_DOCS.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length > 0) {
    return { step: 'required docs', ok: false, reason: `missing: ${missing.join(', ')}` };
  }
  return { step: 'required docs', ok: true };
}

function main() {
  console.log('Publish Readiness Check');
  console.log('======================\n');

  const results = [
    checkVersion(),
    checkPluginJson(),
    checkMarketplaceJson(),
    checkRequiredDocs(),
  ];

  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    if (r.ok) {
      console.log(`  ${icon} ${r.step}`);
    } else {
      console.log(`  ${icon} ${r.step} — ${r.reason}`);
    }
  }

  const blocked = results.filter(r => !r.ok);

  console.log('');

  if (blocked.length === 0) {
    console.log('READY — all publish preconditions met.');
    process.exit(0);
  }

  console.log(`BLOCKED — ${blocked.length} issue(s) must be resolved before publishing:`);
  for (const b of blocked) {
    console.log(`  - ${b.step}: ${b.reason}`);
  }
  process.exit(1);
}

main();
