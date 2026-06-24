#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   build-manifest.mjs — build cdn/components-manifest/index.json

   Scans all yry-* component directories, collects metadata (files, props,
   CSS tokens, runtime deps, exports), and writes the manifest.

   Usage: node scripts/build-manifest.mjs
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CDN = join(__dirname, '..');
const OUT = join(CDN, 'components-manifest', 'index.json');

const PKG = JSON.parse(readFileSync(join(CDN, 'package.json'), 'utf-8'));

/* ── CSS token scanner ───────────────────────────────────────────────────── */
const TOKEN_RE = /var\((--[\w-]+)\)/g;
function scanCssTokens(css) {
  const tokens = new Set();
  let m;
  while ((m = TOKEN_RE.exec(css)) !== null) tokens.add(m[1]);
  return [...tokens].sort();
}

/* ── Prop extractor (Vue defineProps pattern) ────────────────────────────── */
/* Matches both quoted ('name': { type: X }) and unquoted (name: { type: X }) */
const PROP_RE = /(?:^|\s|,)(?:['"]?(\w+)['"]?)\s*:\s*\{\s*type\s*:\s*['"]?(\w+)['"]?(?:[^}]*?default\s*:\s*([^,}\n]+?))?(?:[^}]*?required\s*:\s*(true|false))?\s*[,}]/g;
function scanJsProps(js) {
  const props = [];
  let m;
  while ((m = PROP_RE.exec(js)) !== null) {
    props.push({
      name: m[1],
      type: m[2],
      default: m[3] ? m[3].trim().replace(/['"]/g, '') : null,
      required: m[4] === 'true'
    });
  }
  return props;
}

/* ── Dependency scanner ──────────────────────────────────────────────────── */
function scanDeps(js) {
  const deps = new Set();
  if (js.includes('Vue') || js.includes('createApp') || js.includes('defineComponent')) deps.add('Vue');
  if (js.includes('PanelHub')) deps.add('PanelHub');
  /* Inline imports: from 'lib/xxx' or from '../lib/xxx' */
  const importRe = /from\s+['"]([^'"]+)['"]/g;
  let im;
  while ((im = importRe.exec(js)) !== null) {
    const spec = im[1];
    if (spec.startsWith('.') || spec.startsWith('/lib/') || spec.startsWith('lib/')) {
      const base = spec.split('/').pop().replace(/\.(m)?js$/, '');
      if (base && !base.startsWith('.')) deps.add(base);
    }
  }
  /* Declared deps: YrY.declareDeps([...]) or declaredDeps: [...] */
  const ddMatch = js.match(/declareDeps\s*\(\s*\[([^\]]*)\]/);
  if (ddMatch) {
    const list = ddMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    list.forEach(d => deps.add(d));
  }
  const ddLitMatch = js.match(/declaredDeps\s*:\s*\[([^\]]*)\]/);
  if (ddLitMatch) {
    const list = ddLitMatch[1].replace(/['"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    list.forEach(d => deps.add(d));
  }
  return [...deps].sort();
}

/* ── Export scanner ──────────────────────────────────────────────────────── */
function scanExports(js) {
  const exports = [];
  const re = /(?:window\.|customElements\.define\s*\(\s*['\"])?(\w+)/g;
  // Look for customElements.define('yry-xxx', ...) and window.YryXxx patterns
  const ceMatch = js.matchAll(/customElements\.define\s*\(\s*['\"](\S+)['\"]/g);
  for (const m of ceMatch) exports.push(m[1]);
  const winMatch = js.matchAll(/window\.(Yry\w+)\s*=/g);
  for (const m of winMatch) exports.push(m[1]);
  return [...new Set(exports)];
}

/* ── Kind detection ──────────────────────────────────────────────────────── */
function detectKind(js) {
  return js.includes('createApp') || js.includes('defineComponent') || js.includes('Vue.') ? 'vue' : 'vanilla';
}

/* ── Custom element detection ────────────────────────────────────────────── */
function isCustomElement(js, html) {
  return js.includes('customElements.define') || (html && html.includes('<template'));
}

/* ── Main ────────────────────────────────────────────────────────────────── */
function main() {
  const dirs = readdirSync(CDN, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('yry-'))
    .map(d => d.name)
    .sort();

  const components = [];

  for (const name of dirs) {
    const dir = join(CDN, name);
    const read = (f) => { try { return readFileSync(join(dir, f), 'utf-8'); } catch { return ''; } };
    const size = (f) => { try { return statSync(join(dir, f)).size; } catch { return 0; } };
    const exists = (f) => { try { statSync(join(dir, f)); return true; } catch { return false; } };

    const html = read('index.html');
    const css = read('index.css');
    const js = read('index.js');

    const htmlExists = exists('index.html');
    const cssExists = exists('index.css');
    const jsExists = exists('index.js');

    const kind = jsExists ? detectKind(js) : 'unknown';
    const allExist = htmlExists && cssExists && jsExists;

    const tagMatch = js.match(/customElements\.define\s*\(\s*['\"](\S+)['\"]/);
    const tagName = tagMatch ? tagMatch[1] : name;

    const ceMatch = js.match(/readyEvent\s*[:=]\s*['\"](\S+)['\"]/);
    const readyEvent = ceMatch ? ceMatch[1] : null;

    const tplMatch = html.match(/id\s*=\s*['\"](\S+-tpl)['\"]/);
    const templateId = tplMatch ? tplMatch[1] : null;

    const runtimeDeps = jsExists ? scanDeps(js) : [];
    components.push({
      name,
      kind,
      status: allExist ? 'complete' : 'incomplete',
      tagName,
      readyEvent,
      templateId,
      isCustomElement: isCustomElement(js, html),
      props: jsExists ? scanJsProps(js) : [],
      runtimeDeps,
      declaredDeps: runtimeDeps,
      exports: jsExists ? scanExports(js) : [],
      cssTokens: cssExists ? scanCssTokens(css) : [],
      files: {
        html: { exists: htmlExists, size: htmlExists ? size('index.html') : 0 },
        css: { exists: cssExists, size: cssExists ? size('index.css') : 0 },
        js: { exists: jsExists, size: jsExists ? size('index.js') : 0 }
      }
    });
  }

  const complete = components.filter(c => c.status === 'complete').length;
  const vue = components.filter(c => c.kind === 'vue').length;
  const vanilla = components.filter(c => c.kind === 'vanilla').length;

  const manifest = {
    _meta: {
      generatedAt: new Date().toISOString(),
      cdnVersion: PKG.version,
      generator: 'scripts/build-manifest.mjs',
      schema: 'yry-cdn/components.manifest@1'
    },
    stats: {
      total: components.length,
      vue,
      vanilla,
      complete,
      incomplete: components.length - complete,
      withDemo: components.filter(c => c.files.html.exists).length,
      customElements: components.filter(c => c.isCustomElement).length,
      totalCssTokens: components.reduce((s, c) => s + c.cssTokens.length, 0),
      totalDeclaredDeps: components.reduce((s, c) => s + c.declaredDeps.length, 0),
      totalCount: components.length,
      byKind: { vanilla, vue },
      byStatus: { complete },
      generatedAt: new Date().toISOString()
    },
    components
  };

  writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log('✓ Manifest written: %s (%d components)', OUT, components.length);
}

main();
