#!/usr/bin/env node
/**
 * Deterministic import resolution CLI for the project-scanner agent.
 *
 * The heavy logic now lives under `scripts/lib/import-map/`:
 * - `shared.js`: path helpers and shared indexes
 * - `context.js`: cached config discovery/loading
 * - `sources.js`: regex-based supplemental import extraction
 * - `resolvers.js`: per-language resolution rules + dispatcher
 * - `runner.js`: script orchestration and per-file execution flow
 */

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';

import { main } from './lib/import-map/runner.js';

export {
  resolveCppImport,
  resolveCSharpImport,
  resolveGoImport,
  resolveImport,
  resolveJavaImport,
  resolveKotlinImport,
  resolvePhpImport,
  resolvePythonImport,
  resolveRubyImport,
  resolveRustImport,
  resolveTsJsImport,
} from './lib/import-map/resolvers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(__dirname, '..');
const require = createRequire(resolve(pluginRoot, 'package.json'));

let core;
try {
  core = await import(pathToFileURL(require.resolve('@rui-reports/diagram')).href);
} catch {
  core = await import(pathToFileURL(resolve(pluginRoot, 'engine/core/src/index.js')).href);
}

// ---------------------------------------------------------------------------
// Run only when executed directly as a CLI; importing the module (e.g. from
// tests) must not trigger main().
//
// Canonicalize both sides through realpathSync. Node ESM resolves
// import.meta.url through symlinks but pathToFileURL(process.argv[1]) preserves
// them, so a raw equality check silently no-ops when the script is invoked via
// a symlinked plugin install path (the default in Claude Code / Copilot CLI
// caches). See GitHub issue #162.
// ---------------------------------------------------------------------------
function isCliEntry() {
  if (!process.argv[1]) return false;
  try {
    const modulePath = realpathSync(fileURLToPath(import.meta.url));
    const argvPath = realpathSync(process.argv[1]);
    return modulePath === argvPath;
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  try {
    await main(core);
  } catch (err) {
    process.stderr.write(`extract-import-map.mjs failed: ${err.message}\n${err.stack}\n`);
    process.exit(1);
  }
}
