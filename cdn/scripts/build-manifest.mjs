/**
 * build-manifest.mjs — 自动生成 components.manifest.json
 *
 * 扫描 cdn/ 下所有 yry-* 目录,提取每个组件的元数据:
 *   - 名称 / 标签名 / 类型 (vue | vanilla)
 *   - 文件三件套存在性 (index.html / index.css / index.js)
 *   - props (从 buildComponent 中的字面量提取)
 *   - events (派发的 ready 事件)
 *   - 运行时依赖 (window.Vue, html2canvas, cytoscape ...)
 *   - 注释声明依赖 (从 index.html/js 的 Dependencies 块提取)
 *   - 自有导出 (window.YryBreadcrumb 等 loader 挂载点)
 *   - CSS 字节数 / 文件大小 / 使用的设计令牌
 *
 * 用法:
 *   node scripts/build-manifest.mjs
 *
 * 输出:
 *   components.manifest.json (顶层字段: _meta, components[], stats)
 *
 * 约束:
 *   - 纯 Node ESM,无第三方依赖
 *   - 无 class/extends (项目铁律)
 *   - 失败组件以 status: 'incomplete' 标记,不阻断其他组件
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CDN_ROOT = join(__dirname, '..');

// ── 常量 ────────────────────────────────────────────────────────────────
const PACKAGE_JSON_PATH = join(CDN_ROOT, 'package.json');
const OUTPUT_PATH = join(CDN_ROOT, 'components.manifest.json');
const COMPONENT_PREFIX = 'yry-';

// ── 正则 ────────────────────────────────────────────────────────────────
const PROPS_BLOCK_RE = /props\s*:\s*\{([\s\S]*?)\n\s{4}\}/m;
const PROP_ENTRY_RE = /(\w+)\s*:\s*\{\s*type\s*:\s*([A-Za-z_$][\w.$]*)(?:\s*,\s*default\s*:\s*([^,}]+))?(?:\s*,\s*required\s*:\s*(true|false))?[^}]*\}/g;
const CONST_RE = /var\s+(TEMPLATE_ID|READY_EVENT|TAG_NAME)\s*=\s*['"]([^'"]+)['"]/g;
const WINDOW_DEP_RE = /window\.([A-Z][A-Za-z0-9_$]+)/g;
const CSS_TOKEN_RE = /var\(\s*(--yry-[a-z0-9-]+)/g;
const HAS_CUSTOM_ELEMENT_RE = /defineCustomElement\s*\(/;
const HAS_CE_DEFINE_RE = /customElements\.define\s*\(\s*TAG_NAME/;
// 注释依赖块:从 Dependencies 关键字到注释结束 (--> 或 */)
const DECLARED_DEPS_BLOCK_RE = /Dependencies[\s\S]*?(?:\*\/|-->)/;
const DECLARED_DEPS_ITEM_RE = /-\s+([a-z0-9-]+)/gi;

// ── 工具函数 ────────────────────────────────────────────────────────────

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function listComponentDirs() {
  if (!existsSync(CDN_ROOT)) return [];
  return readdirSync(CDN_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(COMPONENT_PREFIX))
    .map((d) => d.name)
    .sort();
}

function safeReadFile(path) {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function fileSize(path) {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function extractProps(source) {
  if (!source) return [];
  const block = source.match(PROPS_BLOCK_RE);
  if (!block) return [];
  const props = [];
  let m;
  PROP_ENTRY_RE.lastIndex = 0;
  while ((m = PROP_ENTRY_RE.exec(block[1])) !== null) {
    const name = m[1];
    const type = m[2];
    const defaultVal = m[3];
    const required = m[4];
    props.push({
      name,
      type,
      default: defaultVal ? defaultVal.trim().replace(/^['"]|['"]$/g, '') : null,
      required: required === 'true'
    });
  }
  return props;
}

function extractConstants(source) {
  const result = { templateId: null, readyEvent: null, tagName: null };
  if (!source) return result;
  CONST_RE.lastIndex = 0;
  let m;
  while ((m = CONST_RE.exec(source)) !== null) {
    const key = m[1];
    const value = m[2];
    if (key === 'TEMPLATE_ID') result.templateId = value;
    else if (key === 'READY_EVENT') result.readyEvent = value;
    else if (key === 'TAG_NAME') result.tagName = value;
  }
  return result;
}

/**
 * 区分两类 window 引用:
 *   - runtimeDeps:组件需要的外部运行时 (Vue, cytoscape, html2canvas, jspdf ...)
 *   - exports:组件自身注册到 window 的 API (YryBreadcrumb, YrYCytoscapeGraph ...)
 */
function extractWindowRefs(source) {
  if (!source) return { runtimeDeps: [], exports: [] };
  const refs = new Set();
  let m;
  WINDOW_DEP_RE.lastIndex = 0;
  while ((m = WINDOW_DEP_RE.exec(source)) !== null) {
    refs.add(m[1]);
  }
  const deps = [];
  const exportsArr = [];
  const noise = new Set(['YrY', 'YrYReports']);
  for (const name of refs) {
    if (noise.has(name)) continue;
    if (/^Yry[A-Z]/.test(name) || /^YrY[A-Z]/.test(name)) {
      exportsArr.push(name);
    } else {
      deps.push(name);
    }
  }
  return { runtimeDeps: deps.sort(), exports: exportsArr.sort() };
}

function detectKind(source) {
  if (!source) return 'unknown';
  if (HAS_CUSTOM_ELEMENT_RE.test(source) || /window\.Vue/.test(source)) return 'vue';
  return 'vanilla';
}

function extractCssTokens(cssSource) {
  if (!cssSource) return [];
  const tokens = new Set();
  let m;
  CSS_TOKEN_RE.lastIndex = 0;
  while ((m = CSS_TOKEN_RE.exec(cssSource)) !== null) {
    tokens.add(m[1]);
  }
  return [...tokens].sort();
}

/**
 * 从注释中提取声明的依赖(html + js 都查)
 * 形如:
 *   <!-- Dependencies ...:
 *          - html2canvas (for PNG/PDF export)
 *          - jspdf (for PDF export)
 *        -->
 * 或
 *   /* Dependencies ...:
 *        - html2canvas ...
 *      ==/
 */
function extractDeclaredDeps(...sources) {
  const list = [];
  for (const src of sources) {
    if (!src) continue;
    const block = src.match(DECLARED_DEPS_BLOCK_RE);
    if (!block) continue;
    let m;
    DECLARED_DEPS_ITEM_RE.lastIndex = 0;
    while ((m = DECLARED_DEPS_ITEM_RE.exec(block[0])) !== null) {
      list.push(m[1]);
    }
  }
  return [...new Set(list)].sort();
}

function parseComponent(dirName) {
  const dirPath = join(CDN_ROOT, dirName);
  const htmlPath = join(dirPath, 'index.html');
  const cssPath = join(dirPath, 'index.css');
  const jsPath = join(dirPath, 'index.js');

  const htmlSource = safeReadFile(htmlPath);
  const cssSource = safeReadFile(cssPath);
  const jsSource = safeReadFile(jsPath);

  const hasHtml = htmlSource !== null;
  const hasCss = cssSource !== null;
  const hasJs = jsSource !== null;

  const constants = extractConstants(jsSource);
  const isVue = detectKind(jsSource) === 'vue';
  const winRefs = extractWindowRefs(jsSource);
  const declaredDeps = extractDeclaredDeps(htmlSource, jsSource);

  const files = {
    html: { exists: hasHtml, size: fileSize(htmlPath) },
    css: { exists: hasCss, size: fileSize(cssPath) },
    js: { exists: hasJs, size: fileSize(jsPath) }
  };

  let status;
  if (isVue) {
    status = hasHtml && hasCss && hasJs ? 'complete' : 'incomplete';
  } else {
    status = hasCss && hasJs ? 'complete' : 'incomplete';
  }

  return {
    name: dirName,
    kind: detectKind(jsSource),
    status,
    tagName: constants.tagName || dirName,
    readyEvent: constants.readyEvent || (isVue ? `${dirName}-ready` : null),
    templateId: constants.templateId,
    isCustomElement: jsSource ? HAS_CE_DEFINE_RE.test(jsSource) : false,
    props: extractProps(jsSource),
    runtimeDeps: winRefs.runtimeDeps,
    declaredDeps,
    exports: winRefs.exports,
    cssTokens: extractCssTokens(cssSource),
    files
  };
}

function main() {
  const pkg = readJSON(PACKAGE_JSON_PATH);
  const components = listComponentDirs().map(parseComponent);

  const stats = {
    total: components.length,
    vue: components.filter((c) => c.kind === 'vue').length,
    vanilla: components.filter((c) => c.kind === 'vanilla').length,
    complete: components.filter((c) => c.status === 'complete').length,
    incomplete: components.filter((c) => c.status === 'incomplete').length,
    withDemo: components.filter((c) => c.files.html.exists).length,
    customElements: components.filter((c) => c.isCustomElement).length,
    totalCssTokens: new Set(components.flatMap((c) => c.cssTokens)).size,
    totalDeclaredDeps: new Set(components.flatMap((c) => c.declaredDeps)).size
  };

  const manifest = {
    _meta: {
      generatedAt: new Date().toISOString(),
      cdnVersion: pkg.version,
      generator: 'scripts/build-manifest.mjs',
      schema: 'yry-cdn/components.manifest@1'
    },
    stats,
    components
  };

  const tmp = OUTPUT_PATH + '.tmp';
  writeFileSync(tmp, JSON.stringify(manifest, null, 2) + '\n');
  renameSync(tmp, OUTPUT_PATH);

  console.log(
    `[build-manifest] 生成完成 · v${pkg.version} · ${stats.complete}/${stats.total} 完整 · ${stats.withDemo}/${stats.total} 含演示 · ${stats.totalDeclaredDeps} 第三方依赖`
  );
  if (stats.incomplete > 0) {
    const list = components
      .filter((c) => c.status === 'incomplete')
      .map((c) => c.name)
      .join(', ');
    console.warn(`[build-manifest] ⚠️ 不完整: ${list}`);
  }
}

main();