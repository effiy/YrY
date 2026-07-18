import { posix } from 'node:path';

import { TS_JS_LANGS } from './constants.js';
import { dirOf, findNearestConfigDir, resolveRelative, toPosix } from './shared.js';

const TS_EXT_PROBES = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '/index.ts',
  '/index.tsx',
  '/index.js',
  '/index.jsx',
];

const NODENEXT_REWRITES = {
  '.js': ['.ts', '.tsx', '.js', '.jsx'],
  '.jsx': ['.tsx', '.jsx'],
  '.mjs': ['.mts', '.mjs', '.ts'],
  '.cjs': ['.cts', '.cjs', '.ts'],
};

function probeWithExtensions(basePath, fileSet) {
  if (!basePath) return null;
  if (fileSet.has(basePath)) return basePath;

  for (const [outExt, srcExts] of Object.entries(NODENEXT_REWRITES)) {
    if (!basePath.endsWith(outExt)) continue;
    const stem = basePath.slice(0, -outExt.length);
    for (const srcExt of srcExts) {
      const candidate = stem + srcExt;
      if (fileSet.has(candidate)) return candidate;
    }
    return null;
  }

  for (const ext of TS_EXT_PROBES) {
    const candidate = basePath + ext;
    if (fileSet.has(candidate)) return candidate;
  }
  return null;
}

function matchTsAlias(alias, src) {
  const starIdx = alias.indexOf('*');
  if (starIdx === -1) {
    return src === alias ? '' : null;
  }
  const prefix = alias.slice(0, starIdx);
  const suffix = alias.slice(starIdx + 1);
  if (!src.startsWith(prefix)) return null;
  if (!src.endsWith(suffix)) return null;
  if (src.length < prefix.length + suffix.length) return null;
  return src.slice(prefix.length, src.length - suffix.length);
}

function applyTsAlias(target, wildcard) {
  const starIdx = target.indexOf('*');
  if (starIdx === -1) return target;
  return target.slice(0, starIdx) + wildcard + target.slice(starIdx + 1);
}

export function resolveTsJsImport(rawImport, file, ctx) {
  if (!rawImport || typeof rawImport !== 'string') return null;
  const src = rawImport.trim();
  if (!src) return null;

  const importerDir = dirOf(toPosix(file.path));
  if (src.startsWith('./') || src.startsWith('../')) {
    const base = resolveRelative(importerDir, src);
    return probeWithExtensions(base, ctx.fileSet);
  }

  const tsConfigDir = findNearestConfigDir(importerDir, ctx.tsConfigs);
  if (tsConfigDir !== undefined) {
    const tsConfig = ctx.tsConfigs.get(tsConfigDir);
    const { baseUrl, paths } = tsConfig;
    if (paths && paths.size > 0) {
      for (const [alias, targets] of paths) {
        const aliasMatch = matchTsAlias(alias, src);
        if (aliasMatch === null) continue;
        for (const target of targets) {
          const mapped = applyTsAlias(target, aliasMatch);
          const normalizedBase = baseUrl === '.' || baseUrl === ''
            ? ''
            : toPosix(baseUrl);
          const relativeToConfig = normalizedBase
            ? posix.join(normalizedBase, mapped)
            : mapped;
          const candidate = posix.normalize(
            tsConfigDir
              ? posix.join(tsConfigDir, relativeToConfig)
              : relativeToConfig,
          );
          if (candidate.startsWith('..')) continue;
          const probed = probeWithExtensions(candidate, ctx.fileSet);
          if (probed) return probed;
        }
      }
    }
  }

  return null;
}

function resolvePythonProbe(moduleParts, specifiers, ctx) {
  if (moduleParts.length === 0) return [];
  const base = moduleParts.join('/');
  const matches = [];

  const moduleFile = `${base}.py`;
  const packageInit = `${base}/__init__.py`;

  if (ctx.fileSet.has(moduleFile)) {
    matches.push(moduleFile);
    return matches;
  }
  if (ctx.fileSet.has(packageInit)) {
    matches.push(packageInit);
    if (Array.isArray(specifiers)) {
      for (const spec of specifiers) {
        if (!spec || spec === '*' || spec.includes('.')) continue;
        const subFile = `${base}/${spec}.py`;
        const subInit = `${base}/${spec}/__init__.py`;
        if (ctx.fileSet.has(subFile)) matches.push(subFile);
        else if (ctx.fileSet.has(subInit)) matches.push(subInit);
      }
    }
    return matches;
  }

  return [];
}

export function resolvePythonImport(rawImport, specifiers, file, ctx) {
  if (typeof rawImport !== 'string') return [];
  const src = rawImport;
  const importerDir = dirOf(toPosix(file.path));

  let dots = 0;
  while (dots < src.length && src.charCodeAt(dots) === 0x2e) dots++;
  const tail = src.slice(dots);
  const tailSegments = tail ? tail.split('.').filter(Boolean) : [];

  if (dots > 0) {
    const importerParts = importerDir ? importerDir.split('/').filter(Boolean) : [];
    const dropLevels = dots - 1;
    if (dropLevels > importerParts.length) {
      return [];
    }
    const baseParts = importerParts.slice(0, importerParts.length - dropLevels);

    if (tailSegments.length === 0) {
      if (!Array.isArray(specifiers) || specifiers.length === 0) return [];
      const base = baseParts.join('/');
      const matches = [];
      for (const spec of specifiers) {
        if (!spec || spec === '*' || spec.includes('.')) continue;
        const subFile = base ? `${base}/${spec}.py` : `${spec}.py`;
        const subInit = base ? `${base}/${spec}/__init__.py` : `${spec}/__init__.py`;
        if (ctx.fileSet.has(subFile)) matches.push(subFile);
        else if (ctx.fileSet.has(subInit)) matches.push(subInit);
      }
      return matches;
    }

    const moduleParts = baseParts.concat(tailSegments);
    return resolvePythonProbe(moduleParts, specifiers, ctx);
  }

  if (tailSegments.length === 0) {
    return [];
  }

  const importerParts = importerDir ? importerDir.split('/').filter(Boolean) : [];
  for (let i = importerParts.length; i >= 0; i--) {
    const rootParts = importerParts.slice(0, i);
    const candidateModule = rootParts.concat(tailSegments);
    const matches = resolvePythonProbe(candidateModule, specifiers, ctx);
    if (matches.length > 0) return matches;
  }
  return [];
}

export function resolveGoImport(rawImport, file, ctx) {
  if (!rawImport || typeof rawImport !== 'string') return [];
  const src = rawImport.trim();
  if (!src) return [];

  const importerPath = toPosix(file.path);
  const importerDir = dirOf(importerPath);
  const nearestModuleDir = findNearestConfigDir(importerDir, ctx.goModules);
  if (nearestModuleDir === undefined) {
    if (!ctx._warnedNoGoModule.has(importerPath)) {
      ctx._warnedNoGoModule.add(importerPath);
      process.stderr.write(
        `Warning: extract-import-map: Go file ${importerPath} has no ` +
        `ancestor go.mod — import ${src} unresolvable — module-prefix ` +
        `imports skipped\n`,
      );
    }
    return [];
  }

  const moduleName = ctx.goModules.get(nearestModuleDir);
  let remainder;
  if (src === moduleName) {
    remainder = '';
  } else if (src.startsWith(`${moduleName}/`)) {
    remainder = src.slice(moduleName.length + 1);
  } else {
    return [];
  }

  const subDir = toPosix(remainder);
  const targetDir = nearestModuleDir
    ? (subDir ? `${nearestModuleDir}/${subDir}` : nearestModuleDir)
    : subDir;
  const files = ctx.goFilesByDir.get(targetDir);
  return files ? [...files] : [];
}

function resolveDottedFqn(fqn, ext, suffixIndex) {
  if (!fqn || typeof fqn !== 'string') return [];
  const trimmed = fqn.replace(/\.\*$/, '');
  if (!trimmed) return [];
  const filePart = trimmed.replace(/\./g, '/') + ext;
  const matches = suffixIndex.get(filePart);
  return matches ? [...matches] : [];
}

export function resolveJavaImport(rawImport, _file, ctx) {
  return resolveDottedFqn(rawImport, '.java', ctx.javaIndex);
}

export function resolveKotlinImport(rawImport, _file, ctx) {
  return resolveDottedFqn(rawImport, '.kt', ctx.kotlinIndex);
}

export function resolveCSharpImport(rawImport, _file, ctx) {
  return resolveDottedFqn(rawImport, '.cs', ctx.csIndex);
}

export function resolveRubyImport({ kind, source }, file, ctx) {
  if (!source) return [];
  const importerDir = dirOf(toPosix(file.path));
  const withExt = source.endsWith('.rb') ? source : `${source}.rb`;

  if (kind === 'relative') {
    const base = resolveRelative(importerDir, withExt);
    return ctx.fileSet.has(base) ? [base] : [];
  }

  const probes = [`lib/${withExt}`, `app/${withExt}`, withExt];
  for (const p of probes) {
    if (ctx.fileSet.has(p)) return [p];
  }
  return [];
}

export function resolvePhpImport(rawImport, file, ctx) {
  if (!rawImport || typeof rawImport !== 'string') return [];
  const fqn = rawImport.startsWith('\\') ? rawImport.slice(1) : rawImport;
  if (!fqn) return [];

  const importerDir = dirOf(toPosix(file.path));
  const composerDir = findNearestConfigDir(importerDir, ctx.phpAutoloads);
  if (composerDir === undefined) return [];
  const autoload = ctx.phpAutoloads.get(composerDir);
  if (!autoload || autoload.size === 0) return [];

  let bestPrefix = null;
  let bestDirs = null;
  for (const [prefix, dirs] of autoload) {
    if (fqn.startsWith(prefix) && (bestPrefix === null || prefix.length > bestPrefix.length)) {
      bestPrefix = prefix;
      bestDirs = dirs;
    }
  }
  if (bestDirs === null) return [];

  const relative = fqn.slice(bestPrefix.length).replace(/\\/g, '/');
  if (!relative) return [];
  for (const dir of bestDirs) {
    const dirUnderComposer = dir
      ? (composerDir ? `${composerDir}/${dir}` : dir)
      : composerDir;
    const candidate = dirUnderComposer
      ? `${dirUnderComposer}/${relative}.php`
      : `${relative}.php`;
    if (ctx.fileSet.has(candidate)) return [candidate];
  }
  return [];
}

function probeRustModule(base, fileSet) {
  if (!base) return null;
  if (fileSet.has(`${base}.rs`)) return `${base}.rs`;
  if (fileSet.has(`${base}/mod.rs`)) return `${base}/mod.rs`;
  return null;
}

function findRustCrateSrc(importerDir, fileSet) {
  const parts = importerDir.split('/').filter(Boolean);
  for (let i = parts.length; i >= 0; i--) {
    const ancestor = parts.slice(0, i).join('/');
    const childSrc = ancestor ? `${ancestor}/src` : 'src';
    if (fileSet.has(`${childSrc}/lib.rs`) || fileSet.has(`${childSrc}/main.rs`)) {
      return childSrc;
    }
  }
  return null;
}

export function resolveRustImport(rawImport, file, ctx) {
  if (!rawImport || typeof rawImport !== 'string') return [];
  const src = rawImport.trim();
  if (!src) return [];

  const importerDir = dirOf(toPosix(file.path));
  const segments = src.split('::').filter(Boolean);
  if (segments.length === 0) return [];
  const head = segments[0];

  if (head !== 'crate' && head !== 'super' && head !== 'self') return [];

  let baseDir;
  if (head === 'crate') {
    const crateSrc = findRustCrateSrc(importerDir, ctx.fileSet);
    if (!crateSrc) {
      const importerPath = toPosix(file.path);
      if (!ctx._warnedNoRustCrateRoot.has(importerPath)) {
        ctx._warnedNoRustCrateRoot.add(importerPath);
        process.stderr.write(
          `Warning: extract-import-map: Rust file ${importerPath} has ` +
          `'use crate::' but no crate root (src/lib.rs or src/main.rs) ` +
          `found — crate-relative imports unresolved\n`,
        );
      }
      return [];
    }
    baseDir = crateSrc;
  } else if (head === 'super') {
    const parts = importerDir.split('/').filter(Boolean);
    if (parts.length === 0) return [];
    baseDir = parts.slice(0, -1).join('/');
  } else {
    baseDir = importerDir;
  }

  const rest = segments.slice(1);
  for (let i = rest.length; i > 0; i--) {
    const prefix = rest.slice(0, i);
    const base = baseDir
      ? `${baseDir}/${prefix.join('/')}`
      : prefix.join('/');
    const match = probeRustModule(base, ctx.fileSet);
    if (match) return [match];
  }
  return [];
}

export function resolveCppImport(rawImport, file, ctx) {
  if (!rawImport || typeof rawImport !== 'string') return [];
  const src = toPosix(rawImport.trim());
  if (!src) return [];
  const importerDir = dirOf(toPosix(file.path));

  const candidates = [
    resolveRelative(importerDir, src),
    `include/${src}`,
    `src/${src}`,
    src,
  ];
  for (const candidate of candidates) {
    if (candidate && ctx.fileSet.has(candidate)) return [candidate];
  }
  return [];
}

export function resolveImport(imp, file, ctx) {
  const lang = file.language;
  const src = imp.source;
  if (TS_JS_LANGS.has(lang)) {
    const out = resolveTsJsImport(src, file, ctx);
    return out ? [out] : [];
  }
  if (lang === 'python') {
    return resolvePythonImport(src, imp.specifiers, file, ctx);
  }
  if (lang === 'go') {
    return resolveGoImport(src, file, ctx);
  }
  if (lang === 'java') {
    return resolveJavaImport(src, file, ctx);
  }
  if (lang === 'kotlin') {
    return resolveKotlinImport(src, file, ctx);
  }
  if (lang === 'csharp') {
    return resolveCSharpImport(src, file, ctx);
  }
  if (lang === 'php') {
    return resolvePhpImport(src, file, ctx);
  }
  if (lang === 'rust') {
    return resolveRustImport(src, file, ctx);
  }
  if (lang === 'c' || lang === 'cpp') {
    return resolveCppImport(src, file, ctx);
  }
  return [];
}
