import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { buildResolutionContext } from './context.js';
import { resolveImport, resolveRubyImport } from './resolvers.js';
import { extractExtraImportSources, parseRubyImports } from './sources.js';
import { mergeResolved, toPosix } from './shared.js';

async function createRegistry(core) {
  const { TreeSitterPlugin, PluginRegistry, builtinLanguageConfigs, registerAllParsers } = core;

  try {
    const tsConfigs = builtinLanguageConfigs.filter(config => config.treeSitter);
    const tsPlugin = new TreeSitterPlugin(tsConfigs);
    await tsPlugin.init();
    const registry = new PluginRegistry();
    registry.register(tsPlugin);
    registerAllParsers(registry);
    return { registry, treeSitterReady: true };
  } catch (err) {
    process.stderr.write(
      `Warning: extract-import-map: tree-sitter init failed ` +
      `(${err.message}) — all importMap entries will be empty — ` +
      `structural graph will have no import edges\n`,
    );
    return { registry: null, treeSitterReady: false };
  }
}

function resolveFileImports(file, content, registry, ctx) {
  const resolvedSet = new Set();

  if (file.language === 'ruby') {
    for (const imp of parseRubyImports(content)) {
      mergeResolved(resolveRubyImport(imp, file, ctx), resolvedSet, ctx.fileSet);
    }
  } else {
    const analysis = registry.analyzeFile(file.path, content);
    const imports = analysis?.imports ?? [];
    for (const imp of imports) {
      mergeResolved(resolveImport(imp, file, ctx), resolvedSet, ctx.fileSet);
    }
    for (const extra of extractExtraImportSources(file, content)) {
      mergeResolved(
        resolveImport({ source: extra, specifiers: [] }, file, ctx),
        resolvedSet,
        ctx.fileSet,
      );
    }
  }

  return [...resolvedSet].sort((a, b) => a.localeCompare(b));
}

export async function main(core) {
  const [,, inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    process.stderr.write('Usage: node extract-import-map.mjs <input.json> <output.json>\n');
    process.exit(1);
  }

  const inputRaw = readFileSync(inputPath, 'utf-8');
  const input = JSON.parse(inputRaw);
  const { projectRoot, files } = input;
  if (!projectRoot || !Array.isArray(files)) {
    throw new Error('Invalid input: must contain projectRoot and files array');
  }

  const { registry, treeSitterReady } = await createRegistry(core);
  const ctx = await buildResolutionContext(projectRoot, files);

  const importMap = {};
  let filesWithImports = 0;
  let totalEdges = 0;

  for (const file of files) {
    const path = toPosix(file.path);
    if (file.fileCategory !== 'code') {
      importMap[path] = [];
      continue;
    }
    if (!treeSitterReady) {
      importMap[path] = [];
      continue;
    }

    const absolutePath = join(projectRoot, file.path);
    let content;
    try {
      content = readFileSync(absolutePath, 'utf-8');
    } catch (err) {
      process.stderr.write(
        `Warning: extract-import-map: import resolution failed for ${path} ` +
        `(read error: ${err.message}) — importMap[${path}]=[]\n`,
      );
      importMap[path] = [];
      continue;
    }

    try {
      const resolved = resolveFileImports(file, content, registry, ctx);
      importMap[path] = resolved;
      if (resolved.length > 0) {
        filesWithImports += 1;
        totalEdges += resolved.length;
      }
    } catch (err) {
      process.stderr.write(
        `Warning: extract-import-map: import resolution failed for ${path} ` +
        `(analyze error: ${err.message}) — importMap[${path}]=[]\n`,
      );
      importMap[path] = [];
    }
  }

  const output = {
    scriptCompleted: true,
    stats: {
      filesScanned: files.length,
      filesWithImports,
      totalEdges,
    },
    importMap,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  if (!existsSync(outputPath)) {
    throw new Error(`output file missing after write: ${outputPath}`);
  }

  process.stderr.write(
    `extract-import-map: filesScanned=${files.length} ` +
    `filesWithImports=${filesWithImports} totalEdges=${totalEdges}\n`,
  );
}
