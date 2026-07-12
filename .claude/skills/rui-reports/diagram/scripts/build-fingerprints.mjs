#!/usr/bin/env node
/**
 * build-fingerprints.mjs
 *
 * Builds the structural-fingerprint baseline used by incremental change
 * detection. Runs once per /understand full rebuild (Phase 7 step 2.5),
 * generating fingerprints.json in the output directory.
 *
 * Replaces the LLM-written fingerprint script that previously sat in
 * SKILL.md as a code example — that example had the wrong signature
 * for buildFingerprintStore() and never successfully produced a baseline,
 * which silently broke auto-update for every install (see issue #152).
 *
 * Usage:
 *   node build-fingerprints.mjs <input.json>
 *
 * Input JSON:
 *   { projectRoot: string, outputDir: string, sourceFilePaths: string[], gitCommitHash: string }
 *
 * Writes: <outputDir>/intermediate/fingerprints.json
 * Exit code: 0 on success (including 0 files analyzed); non-zero on error.
 */

import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/ -> plugin root is two dirs up
const pluginRoot = resolve(__dirname, '../..');
const require = createRequire(resolve(pluginRoot, 'package.json'));

// ---------------------------------------------------------------------------
// Resolve @rui-reports/diagram (matches extract-structure.mjs).
// pathToFileURL() is required for Windows: dynamic import() of a raw
// "C:\..." path throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
// ---------------------------------------------------------------------------
let core;
try {
  core = await import(pathToFileURL(require.resolve('@rui-reports/diagram')).href);
} catch {
  core = await import(pathToFileURL(resolve(pluginRoot, 'engine/core/src/index.js')).href);
}

const {
  TreeSitterPlugin,
  PluginRegistry,
  builtinLanguageConfigs,
  registerAllParsers,
  buildFingerprintStore,
  saveFingerprints,
} = core;

async function main() {
  const [, , inputPath] = process.argv;
  if (!inputPath) {
    process.stderr.write('Usage: node build-fingerprints.mjs <input.json>\n');
    process.exit(1);
  }

  const { projectRoot, outputDir, sourceFilePaths, gitCommitHash } = JSON.parse(
    readFileSync(inputPath, 'utf-8'),
  );

  if (
    !projectRoot
    || !outputDir
    || !Array.isArray(sourceFilePaths)
    || typeof gitCommitHash !== 'string'
  ) {
    throw new Error(
      'Invalid input: requires { projectRoot: string, outputDir: string, sourceFilePaths: string[], gitCommitHash: string }',
    );
  }

  // Create tree-sitter plugin with all configs that have WASM grammars,
  // mirroring extract-structure.mjs so the baseline matches the comparison
  // logic used during auto-updates.
  const tsConfigs = builtinLanguageConfigs.filter((c) => c.treeSitter);
  const tsPlugin = new TreeSitterPlugin(tsConfigs);
  await tsPlugin.init();

  const registry = new PluginRegistry();
  registry.register(tsPlugin);
  registerAllParsers(registry);

  const store = buildFingerprintStore(projectRoot, sourceFilePaths, registry, gitCommitHash);
  const fingerprintsPath = join(outputDir, 'intermediate', 'fingerprints.json');
  mkdirSync(join(outputDir, 'intermediate'), { recursive: true });
  writeFileSync(fingerprintsPath, JSON.stringify(store, null, 2), 'utf-8');

  const fileCount = Object.keys(store.files).length;
  process.stdout.write(`Fingerprints baseline: ${fileCount} files -> ${fingerprintsPath}\n`);
}

await main();
