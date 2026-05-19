#!/usr/bin/env node
/**
 * Version consistency validator — reads version-sources.json,
 * extracts version from each declared location, and checks consistency.
 *
 * Exit: 0 = all consistent, 1 = mismatch or errors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(__dirname, 'version-sources.json');

function fail(reason) {
  console.error(`[validate] ${reason}`);
  process.exit(1);
}

function resolveField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
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
  return current;
}

function extractVersion(source) {
  const filePath = path.join(ROOT, source.file);

  if (!fs.existsSync(filePath)) {
    return { label: source.label, file: source.file, version: null, error: 'file not found' };
  }

  const raw = fs.readFileSync(filePath, 'utf-8');

  if (source.field.startsWith('regex:')) {
    const pattern = source.field.slice(6);
    const re = new RegExp(pattern, 'm');
    const match = raw.match(re);
    if (!match || !match[1]) {
      return { label: source.label, file: source.file, version: null, error: `regex no match: ${pattern}` };
    }
    return { label: source.label, file: source.file, version: match[1], error: null };
  }

  try {
    const obj = JSON.parse(raw);
    const val = resolveField(obj, source.field);
    if (val === undefined || val === null) {
      return { label: source.label, file: source.file, version: null, error: `field "${source.field}" not found` };
    }
    return { label: source.label, file: source.file, version: String(val), error: null };
  } catch (e) {
    return { label: source.label, file: source.file, version: null, error: `parse error: ${e.message}` };
  }
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fail(`config not found: ${CONFIG_PATH}`);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (e) {
    fail(`config parse error: ${e.message}`);
  }

  if (!config.sources || !Array.isArray(config.sources) || config.sources.length === 0) {
    fail('config has no sources array');
  }

  const results = config.sources.map(extractVersion);

  const errors = results.filter(r => r.error);
  const versions = results.filter(r => r.version !== null).map(r => r.version);
  const unique = [...new Set(versions)];

  console.log('Version Consistency Check');
  console.log('=========================\n');

  let maxLabelLen = Math.max(...results.map(r => r.label.length));

  for (const r of results) {
    const pad = ' '.repeat(maxLabelLen - r.label.length);
    if (r.error) {
      console.log(`  ${r.label}${pad}  FAIL  (${r.error})`);
    } else {
      console.log(`  ${r.label}${pad}  ${r.version}`);
    }
  }

  console.log('');

  if (errors.length > 0) {
    console.log(`FAIL — ${errors.length} source(s) could not be read`);
    process.exit(1);
  }

  if (unique.length === 1) {
    console.log(`PASS — all ${results.length} sources agree on version ${unique[0]}`);
    process.exit(0);
  }

  console.log(`FAIL — version mismatch detected:`);
  for (const r of results) {
    console.log(`  ${r.label}: ${r.version}`);
  }
  process.exit(1);
}

main();
