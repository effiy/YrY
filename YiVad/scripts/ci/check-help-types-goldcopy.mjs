// scripts/ci/check-help-types-goldcopy.mjs
// --------------------------------------------------------------------
// CI 门禁（PRD §11.2 / Dev §9 GC-1）—— HelpOS Types Gold Copy 一致性
// 算法（稳健版）：
//   1) 从 PRD 文件中抽出 §6.1 类型代码块（```typescript ... ```）；
//   2) 从 types.ts 读取源码，去掉注释/空行后，按「接口/类型声明」和「字段行」做归一化；
//   3) 对比关键字段签名：
//      - 类型集合 {type/interface 名}
//      - 每个类型的 {字段名 [:?]} 集合
//   4) diff ≤ 3 行 → PASS，> 3 → FAIL
// --------------------------------------------------------------------
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const cli = (flag, d) => {
  const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : d;
};
const PRD_PATH = resolve(__dirname, cli("--prd", "../../../YiKnowledge/projects/yivad/prds/2026-09/35-prd-快捷键参考与帮助中心.md"));
const TYPES_PATH = resolve(__dirname, cli("--types", "../../src/components/HelpCenter/types.ts"));

if (!existsSync(PRD_PATH)) { console.log(`[W] PRD missing, skip goldcopy check: ${PRD_PATH}`); process.exit(0); }
if (!existsSync(TYPES_PATH)) { console.error(`[F] Types file missing: ${TYPES_PATH}`); process.exit(2); }

const prd = readFileSync(PRD_PATH, "utf8");
const types = readFileSync(TYPES_PATH, "utf8");

/* ── 步骤 1：从 PRD 抽取 §6.1 类型代码块 ────────────────────────── */
const SECTION_START = /###\s*6\.1\s*.*Gold Copy/s;
const s1 = SECTION_START.exec(prd);
if (!s1) { console.error(`[F] 未在 PRD 找到 §6.1 Gold Copy 章节`); process.exit(2); }
const tail = prd.slice(s1.index);
// 找到第一个 ```typescript
const codeStart = tail.indexOf("```typescript");
if (codeStart < 0) { console.error(`[F] 未找到 §6.1 中的 \`\`\`typescript 代码块`); process.exit(2); }
const codeBegin = codeStart + "```typescript".length;
const codeEnd = tail.indexOf("```", codeBegin);
if (codeEnd < 0) { console.error(`[F] §6.1 代码块未闭合（找不到结束的 \`\`\`）`); process.exit(2); }
const prdCodeRaw = tail.slice(codeBegin, codeEnd).trim();

/* ── 步骤 2：从 types.ts 取源码，去掉 import + 注释，只留类型定义 ─── */
const stripImports = s => s.replace(/^import\s+[^;]+;?/gm, "");
const stripBlockComments = s => s.replace(/\/\*[\s\S]*?\*\//g, " ");
const stripLineComments = s => s.replace(/^\s*\/\/.*$/gm, "");
const stripJsdoc = s => s.replace(/^\s*\*\s?.*$/gm, ""); // 其实已在 block comments 处理
const normalize = s => stripJsdoc(stripLineComments(stripBlockComments(stripImports(s))));

/* 解析类型定义：返回 { [TypeName]: Set<field[:?]> } ─────────────── */
function parseDecl(text) {
  const norm = normalize(text).replace(/\r/g, "");
  const out = new Map();
  // 抓取每个 type/interface 到下一个 type/interface 或文件结尾
  const re = /(?:^|\n)\s*export\s+(?:type|interface)\s+([A-Z][A-Za-z0-9_]+)\s*(?:=|:)?\s*\{?([\s\S]*?)\n\s*\}?(?=\n\s*export\s+(?:type|interface)|$)/g;
  let m;
  while ((m = re.exec(norm)) !== null) {
    const [, name, body] = m;
    const fields = new Set();
    for (const line of body.split("\n")) {
      const l = line.trim().replace(/,$/, "");
      if (!l || l === "{" || l === "}" || /^[|;]/.test(l)) continue;
      // 只读 / 可选字段名：readonly F?:  或  F?:  或  readonly F  :  或  F  :
      const fm = l.match(/^(?:readonly\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*(\??)\s*[:=]/);
      if (fm) fields.add(fm[1] + (fm[2] || ""));
      else {
        // type T = 'a' | 'b' | ... 枚举行 → 每一项作为字段（也可以用联合体名做键）
        const am = l.match(/^\|\s*['"]([^'"]+)['"]\s*$/);
        if (am) fields.add(`|'${am[1]}'`);
      }
    }
    out.set(name, fields);
  }
  return out;
}

/* 另外收集 type union 成员（不在 {} 里，直接 = 'a' | 'b' | ...） */
function parseUnions(text) {
  const norm = normalize(text).replace(/\r/g, "");
  const out = new Map();
  const re = /(?:^|\n)\s*export\s+type\s+([A-Z][A-Za-z0-9_]+)\s*=\s*([^;{}]+?)(?=\n\s*export|$)/g;
  let m;
  while ((m = re.exec(norm)) !== null) {
    const [, name, raw] = m;
    if (raw.includes("{")) continue; // 已作为 interface/type body 处理
    const items = [...raw.matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]);
    if (items.length) out.set(name, new Set(items));
  }
  return out;
}

const PRD_DECL = parseDecl(prdCodeRaw);
const PRD_UNION = parseUnions(prdCodeRaw);
const CODE_DECL = parseDecl(types);
const CODE_UNION = parseUnions(types);

/* 合并 */
const unionTypeNames = new Set([...PRD_UNION.keys(), ...CODE_UNION.keys()]);
const PRD_FULL = new Map([...PRD_DECL.entries()]);
for (const [k, v] of PRD_UNION.entries()) {
  const merged = new Set([...(PRD_FULL.get(k) || []), ...v]);
  PRD_FULL.set(k, merged);
}
const CODE_FULL = new Map([...CODE_DECL.entries()]);
for (const [k, v] of CODE_UNION.entries()) {
  const merged = new Set([...(CODE_FULL.get(k) || []), ...v]);
  CODE_FULL.set(k, merged);
}

/* ── 步骤 3：计算 diff ─────────────────────────────────────────── */
const allTypeNames = [...new Set([...PRD_FULL.keys(), ...CODE_FULL.keys()])].sort();
const rows = [];
let deltaCount = 0;
for (const name of allTypeNames) {
  const p = PRD_FULL.get(name);
  const c = CODE_FULL.get(name);
  if (!p) { rows.push({ kind: "only-code", name, info: `类型 ${name} 仅在代码中存在（未写入 PRD §6.1）` }); deltaCount++; continue; }
  if (!c) { rows.push({ kind: "only-prd", name, info: `类型 ${name} 仅在 PRD 中存在（未实现）` }); deltaCount++; continue; }
  const onlyP = [...p].filter(x => !c.has(x));
  const onlyC = [...c].filter(x => !p.has(x));
  for (const f of onlyP) { rows.push({ kind: "only-prd", name, info: `字段 ${name}.${f} 仅 PRD 有` }); deltaCount++; }
  for (const f of onlyC) { rows.push({ kind: "only-code", name, info: `字段 ${name}.${f} 仅代码有` }); deltaCount++; }
}

/* 专门处理 union 类型的成员（比如 HelpTabId 字面量成员等） */
for (const name of unionTypeNames) {
  const p = PRD_UNION.get(name) || new Set();
  const c = CODE_UNION.get(name) || new Set();
  const onlyP = [...p].filter(x => !c.has(x));
  const onlyC = [...c].filter(x => !p.has(x));
  for (const m of onlyP) { rows.push({ kind: "union-only-prd", name, info: `Union 成员 ${name} = '${m}' 仅 PRD 有` }); deltaCount++; }
  for (const m of onlyC) { rows.push({ kind: "union-only-code", name, info: `Union 成员 ${name} = '${m}' 仅代码有` }); deltaCount++; }
}

console.log(`[check-help-types-goldcopy]`);
console.log(`  类型名：PRD ${PRD_FULL.size} 个  vs  代码 ${CODE_FULL.size} 个`);
console.log(`  关键字段差异行数 = ${deltaCount}（阈值 Δ ≤ 3 PASS / Δ > 3 FAIL）`);

if (rows.length) {
  const first = rows.slice(0, 20);
  console.log(`  Diff 明细（前 20 条）:`);
  for (const r of first) console.log(`    · [${r.kind}] ${r.info}`);
  if (rows.length > 20) console.log(`    · ...（其余 ${rows.length - 20} 条省略）`);
}

if (deltaCount > 3) {
  console.error(`[FAIL] HelpOS Types Gold Copy 一致性检查失败：Δ = ${deltaCount} > 3，请同步修改 PRD §6.1 或 src/components/HelpCenter/types.ts`);
  process.exit(1);
}
console.log(`[PASS] check-help-types-goldcopy`);
process.exit(0);
