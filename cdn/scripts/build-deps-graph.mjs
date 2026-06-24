#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   build-deps-graph.mjs — scan yry-* components for inter-component deps

   For each yry-<name>/index.{html,js,css}, extract <yry-*> tag references
   (excluding self). Output cdn/deps-graph.json consumed by graph.html.

   Usage: node scripts/build-deps-graph.mjs
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN = join(__dirname, '..');
const OUT = join(CDN, 'deps-graph.json');
const MANIFEST = join(CDN, 'components-manifest', 'index.json');

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const valid = new Set(manifest.components.map(c => c.name));

// Match actual custom element usage only:
//   <yry-foo ...>   </yry-foo>   'yry-foo'   "yry-foo"
// Excludes CSS class (.yry-foo) and attribute names (yry-foo=).
const TAG_RE = /<\/?yry-([a-z][a-z0-9-]*)/g;
const QUOTED_RE = /["']yry-([a-z][a-z0-9-]*)["']/g;

function scanComponent(name) {
  const refs = new Set();
  for (const ext of ['html', 'js']) {
    const p = join(CDN, name, `index.${ext}`);
    let src;
    try { src = readFileSync(p, 'utf8'); } catch { continue; }
    let m;
    while ((m = TAG_RE.exec(src)) !== null) refs.add('yry-' + m[1]);
    while ((m = QUOTED_RE.exec(src)) !== null) refs.add('yry-' + m[1]);
  }
  refs.delete(name);
  return [...refs].sort();
}

const dirs = [...valid].sort();

const nodes = [];
const edges = [];
const ignored = [];

for (const name of dirs) {
  const refs = scanComponent(name);
  nodes.push({ name, deps: refs });
  for (const target of refs) {
    if (valid.has(target)) {
      edges.push({ from: name, to: target });
    } else {
      ignored.push({ from: name, to: target });
    }
  }
}

const out = {
  _meta: {
    generatedAt: new Date().toISOString(),
    generator: 'scripts/build-deps-graph.mjs',
    schema: 'yry-cdn/deps-graph@1'
  },
  stats: {
    nodes: nodes.length,
    edges: edges.length,
    withDeps: nodes.filter(n => n.deps.length > 0).length,
    ignoredRefs: ignored.length
  },
  nodes,
  edges
};

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`✓ deps-graph.json written: ${nodes.length} nodes · ${edges.length} edges · ${ignored.length} ignored refs (non-component yry-* identifiers)`);
