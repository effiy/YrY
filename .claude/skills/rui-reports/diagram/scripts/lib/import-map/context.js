import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import { buildSuffixIndex, dirOf, toPosix } from './shared.js';

async function readFilesParallel(paths) {
  return Promise.all(
    paths.map(async ({ key, absPath }) => {
      try {
        const raw = await readFile(absPath, 'utf-8');
        return { key, raw, err: null };
      } catch (err) {
        return { key, raw: null, err };
      }
    }),
  );
}

function baseName(p) {
  const i = p.lastIndexOf('/');
  return i === -1 ? p : p.slice(i + 1);
}

function collectConfigCandidates(projectRoot, files, filename) {
  const out = [];
  for (const f of files) {
    const p = toPosix(f.path);
    if (baseName(p) !== filename) continue;
    const absPath = join(projectRoot, p);
    if (!existsSync(absPath)) continue;
    out.push({ key: p, absPath });
  }
  return out;
}

function parseTsConfigText(raw) {
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const compilerOptions = parsed?.compilerOptions ?? {};
  const baseUrl = compilerOptions.baseUrl ?? '.';
  const paths = new Map();
  if (compilerOptions.paths && typeof compilerOptions.paths === 'object') {
    for (const [alias, targets] of Object.entries(compilerOptions.paths)) {
      if (Array.isArray(targets)) {
        paths.set(alias, targets);
      }
    }
  }
  return { baseUrl, paths };
}

async function loadTsConfigs(projectRoot, files) {
  const out = new Map();
  const warnings = [];
  const candidates = collectConfigCandidates(projectRoot, files, 'tsconfig.json');
  const reads = await readFilesParallel(candidates);
  for (const { key: p, raw, err } of reads) {
    if (err) {
      warnings.push(
        `Warning: extract-import-map: tsconfig.json at ${join(projectRoot, p)} failed ` +
        `to read (${err.message}) — path aliases from this config will ` +
        `not be applied — relative imports unaffected\n`,
      );
      continue;
    }
    const parsed = parseTsConfigText(raw);
    if (!parsed) {
      warnings.push(
        `Warning: extract-import-map: tsconfig.json at ${join(projectRoot, p)} failed ` +
        `to parse — path aliases from this config will not be applied ` +
        `— relative imports unaffected\n`,
      );
      continue;
    }
    out.set(dirOf(p), parsed);
  }
  return { configs: out, warnings };
}

async function loadGoModules(projectRoot, files) {
  const out = new Map();
  const warnings = [];
  const candidates = collectConfigCandidates(projectRoot, files, 'go.mod');
  const reads = await readFilesParallel(candidates);
  for (const { key: _p, raw, err } of reads) {
    if (err) continue;
    let moduleName = '';
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.replace(/\/\/.*$/, '').trim();
      if (!trimmed.startsWith('module ')) continue;
      moduleName = trimmed.slice('module '.length).trim();
      break;
    }
    if (!moduleName) continue;
    out.set(dirOf(_p), moduleName);
  }
  return { modules: out, warnings };
}

function parseComposerAutoloadText(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const out = new Map();
  const psr4 = parsed?.autoload?.['psr-4'];
  if (!psr4 || typeof psr4 !== 'object') return out;
  for (const [prefix, target] of Object.entries(psr4)) {
    const targets = Array.isArray(target) ? target : [target];
    const normalized = targets
      .filter(t => typeof t === 'string')
      .map(t => toPosix(t).replace(/\/$/, ''));
    const normalizedPrefix = prefix === '' || prefix.endsWith('\\') ? prefix : `${prefix}\\`;
    out.set(normalizedPrefix, normalized);
  }
  return out;
}

async function loadPhpAutoloads(projectRoot, files) {
  const out = new Map();
  const warnings = [];
  const candidates = collectConfigCandidates(projectRoot, files, 'composer.json');
  const reads = await readFilesParallel(candidates);
  for (const { key: p, raw, err } of reads) {
    if (err) {
      warnings.push(
        `Warning: extract-import-map: composer.json at ${join(projectRoot, p)} failed ` +
        `to read (${err.message}) — PSR-4 namespace mapping from this ` +
        `composer.json unavailable — PHP imports under this package ` +
        `will not resolve\n`,
      );
      continue;
    }
    const parsed = parseComposerAutoloadText(raw);
    if (parsed === null) {
      warnings.push(
        `Warning: extract-import-map: composer.json at ${join(projectRoot, p)} failed ` +
        `to parse — PSR-4 namespace mapping unavailable — PHP imports ` +
        `under this package will not resolve\n`,
      );
      continue;
    }
    out.set(dirOf(p), parsed);
  }
  return { autoloads: out, warnings };
}

export async function buildResolutionContext(projectRoot, files) {
  const fileSet = new Set(files.map(f => toPosix(f.path)));

  const [tsResult, goResult, phpResult] = await Promise.all([
    loadTsConfigs(projectRoot, files),
    loadGoModules(projectRoot, files),
    loadPhpAutoloads(projectRoot, files),
  ]);
  for (const warning of tsResult.warnings) process.stderr.write(warning);
  for (const warning of goResult.warnings) process.stderr.write(warning);
  for (const warning of phpResult.warnings) process.stderr.write(warning);

  const goFilesByDir = new Map();
  for (const f of files) {
    if (!f.path.endsWith('.go')) continue;
    const p = toPosix(f.path);
    const d = dirOf(p);
    if (!goFilesByDir.has(d)) goFilesByDir.set(d, []);
    goFilesByDir.get(d).push(p);
  }
  for (const arr of goFilesByDir.values()) {
    arr.sort((a, b) => a.localeCompare(b));
  }

  return {
    projectRoot,
    fileSet,
    tsConfigs: tsResult.configs,
    goModules: goResult.modules,
    goFilesByDir,
    javaIndex: buildSuffixIndex(files, p => p.endsWith('.java')),
    kotlinIndex: buildSuffixIndex(files, p => p.endsWith('.kt')),
    csIndex: buildSuffixIndex(files, p => p.endsWith('.cs')),
    phpAutoloads: phpResult.autoloads,
    _warnedNoRustCrateRoot: new Set(),
    _warnedNoGoModule: new Set(),
  };
}
