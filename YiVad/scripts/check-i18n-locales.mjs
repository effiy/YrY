#!/usr/bin/env node
/**
 * @file scripts/check-i18n-locales.mjs
 * @description 校验 YiVad/src/languages/modules/** 各模块 zh/en 两份 locale 键是否双射
 *              - 结构一致（键名集合相同）
 *              - 占位符集合一致（按 key 分组比对 {name}）
 *
 * Usage:
 *   pnpm i18n:check                # 只扫描 src/languages/modules
 *   pnpm i18n:check --detail       # 打印每个模块摘要与占位符明细
 *
 * Exit:
 *   0 一致
 *   1 不一致（stdout 会按模块列出差异）
 */
import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MODULES_DIR = join(ROOT, "src", "languages", "modules");
const DETAIL = process.argv.includes("--detail") || process.argv.includes("-d");

function walkModules(dir) {
  const entries = readdirSync(dir);
  const modules = [];
  for (const name of entries) {
    if (name === "index.ts") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const zh = join(full, "zh.ts");
      const en = join(full, "en.ts");
      if (existsSync(zh) && existsSync(en)) modules.push({ name, zh, en });
      else modules.push({ name, zh: existsSync(zh) ? zh : null, en: existsSync(en) ? en : null, missing: true });
    }
  }
  return modules;
}

/**
 * 使用 TypeScript Compiler API 解析 export default { ... }，
 * 提取 { keyPath: { placeholders, src } } map。
 */
function extractKeyMap(filePath) {
  const src = readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile("x.ts", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out = new Map();

  /** 找到 export default 的那个 ObjectLiteralExpression */
  let rootObj = null;
  ts.forEachChild(sf, (n) => {
    if (ts.isExportAssignment(n) && ts.isObjectLiteralExpression(n.expression)) {
      rootObj = n.expression;
    }
  });
  if (!rootObj) {
    // 支持 `export default xxx` 是 Identifier 的情况？这里不考虑
    return out;
  }

  function visitObject(node, pathStack) {
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        let key;
        if (ts.isIdentifier(prop.name)) key = prop.name.text;
        else if (ts.isStringLiteral(prop.name)) key = prop.name.text;
        else if (ts.isNumericLiteral(prop.name)) key = prop.name.text;
        else continue;
        const fullKey = [...pathStack, key].join(".");

        if (ts.isObjectLiteralExpression(prop.initializer)) {
          visitObject(prop.initializer, [...pathStack, key]);
          continue;
        }
        if (ts.isArrayLiteralExpression(prop.initializer)) {
          // 数组项不做细粒度对齐，跳过（locale 数组通常是并列同构项，不是业务语义层级）
          continue;
        }
        if (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
          const text = prop.initializer.text;
          out.set(fullKey, makeVal(text));
          continue;
        }
        if (ts.isTemplateExpression(prop.initializer)) {
          // 模板字符串：拼接 head + spans，把 ${expr} 替换为 "{expr}"
          let buf = prop.initializer.head.text;
          for (const span of prop.initializer.templateSpans) buf += `{${span.expression.getText(sf)}}` + span.literal.text;
          out.set(fullKey, makeVal(buf));
          continue;
        }
        if (ts.isPrefixUnaryExpression(prop.initializer) && prop.initializer.operator === ts.SyntaxKind.MinusToken) {
          // 负数数字值（非文本，忽略）
          continue;
        }
        if (ts.isNumericLiteral(prop.initializer) || prop.initializer.kind === ts.SyntaxKind.TrueKeyword || prop.initializer.kind === ts.SyntaxKind.FalseKeyword || prop.initializer.kind === ts.SyntaxKind.NullKeyword) {
          continue;
        }
        // 其他：忽略（如 Identifier、CallExpression）
      }
    }
  }
  visitObject(rootObj, []);
  return out;
}

function makeVal(text) {
  const placeholders = new Set();
  const rx = /\{([A-Za-z_][\w]*)\}/g;
  let m;
  while ((m = rx.exec(text)) !== null) placeholders.add(m[1]);
  return { placeholders: [...placeholders].sort(), src: text.length > 80 ? text.slice(0, 80) : text };
}

function diffKeyMap(a, b) {
  const ak = [...a.keys()].sort();
  const bk = [...b.keys()].sort();
  const onlyInA = ak.filter(k => !b.has(k));
  const onlyInB = bk.filter(k => !a.has(k));
  const diffPlaceholders = [];
  for (const k of ak) {
    if (!b.has(k)) continue;
    const pa = JSON.stringify(a.get(k).placeholders);
    const pb = JSON.stringify(b.get(k).placeholders);
    if (pa !== pb) diffPlaceholders.push({ key: k, zh: a.get(k).placeholders, en: b.get(k).placeholders });
  }
  return { onlyInA, onlyInB, diffPlaceholders };
}

// =============== Main ===============
if (!existsSync(MODULES_DIR)) {
  console.error(`[i18n:check] MODULES_DIR not found: ${MODULES_DIR}`);
  process.exit(2);
}
const modules = walkModules(MODULES_DIR);
if (modules.length === 0) {
  console.error("[i18n:check] No locale module found. Check src/languages/modules layout.");
  process.exit(2);
}

const failures = [];
for (const m of modules) {
  if (m.missing) {
    failures.push(`\n  [${m.name}] 缺失配对文件: zh.ts=${m.zh ? "OK" : "MISSING"} | en.ts=${m.en ? "OK" : "MISSING"}`);
    continue;
  }
  const zh = extractKeyMap(m.zh);
  const en = extractKeyMap(m.en);
  const diff = diffKeyMap(zh, en);
  const bad = diff.onlyInA.length + diff.onlyInB.length + diff.diffPlaceholders.length;
  if (DETAIL) {
    console.log(`[i18n:check] ${m.name}: zh=${zh.size} keys, en=${en.size} keys${bad ? "  ⚠️  DIFF" : "  OK"}`);
  }
  if (!bad) continue;
  let buf = `\n  [${m.name}]`;
  if (diff.onlyInA.length) buf += `\n    只在 zh.ts (${diff.onlyInA.length}):\n      - ${diff.onlyInA.join("\n      - ")}`;
  if (diff.onlyInB.length) buf += `\n    只在 en.ts (${diff.onlyInB.length}):\n      - ${diff.onlyInB.join("\n      - ")}`;
  if (diff.diffPlaceholders.length) {
    const strs = diff.diffPlaceholders.map(d =>
      `${d.key}: zh=[${d.zh.join(",")}] en=[${d.en.join(",")}]`
    );
    buf += `\n    占位符不一致 (${diff.diffPlaceholders.length}):\n      - ${strs.join("\n      - ")}`;
  }
  failures.push(buf);
}

if (failures.length === 0) {
  console.log(`[i18n:check] PASS  ${modules.length} module(s) checked; zh/en keys+placeholders 一致。`);
  process.exit(0);
} else {
  console.error(`[i18n:check] FAIL  共 ${modules.length} 个模块，${failures.length} 个存在问题：`);
  console.error(failures.join("\n"));
  console.error("\n修复指引参见：YiKnowledge/projects/yivad/workflows/开发规范/08-规范-国际化规范.md §7");
  process.exit(1);
}
