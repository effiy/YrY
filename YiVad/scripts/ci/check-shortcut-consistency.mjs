// scripts/ci/check-shortcut-consistency.mjs
// --------------------------------------------------------------------
// CI 门禁（PRD §10 SLI-6 / Dev §2 GC-2）—— 禁止静态手写快捷键副本
//   PASS：src/components/HelpCenter/** 内「静态快捷键数组字面量」数量  == defaults.ts 条目数（若 defaults 不存在，则与 registry 对比）
// 实现要点：
//   - 静态快捷键数组 = 连续出现 >= 3 次 "Ctrl+" / "Alt+" / "⌘" / "⌥" 这种字面量的同一个 [] 代码块内元素
//   - 唯一 SSOT = ShortcutRegistry.getAllShortcuts()
// --------------------------------------------------------------------
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const ROOT = resolve(__dirname, "../..");
const HELP_DIR = join(ROOT, "src/components/HelpCenter");
const DEFAULTS = join(ROOT, "src/shortcuts/defaults.ts");
const REGISTRY = join(ROOT, "src/shortcuts/registry.ts");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(vue|ts|tsx|js|mjs)$/.test(p)) out.push(p);
  }
  return out;
}
const helpFiles = walk(HELP_DIR);

const KEY_RE = /(?:Ctrl|Control|Alt|Shift|Meta|Cmd|Command|⌘|⌥|⇧|⌃)[^"'`\s)\]]*/;

/* 简易 [] 块扫描：统计每个数组块内 KEY_RE 匹配次数 */
function countStaticArrays(text) {
  let depth = 0, start = -1;
  const blocks = [];
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const prev = i ? text[i - 1] : "";
    if ((ch === '"' || ch === "'" || ch === "`") && prev !== "\\") {
      const quote = ch;
      i++;
      while (i < text.length && text[i] !== quote) { if (text[i] === "\\") i++; i++; }
      continue;
    }
    if (ch === "[") { if (depth === 0) { start = i; stack.push(i); } depth++; }
    else if (ch === "]") {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && start >= 0) { blocks.push(text.slice(start, i + 1)); start = -1; }
    }
  }
  return blocks.filter(b => {
    const m = [...b.matchAll(new RegExp(KEY_RE.source, "g"))].length;
    return m >= 3;
  });
}

let staticCopies = 0;
const offenders = [];
for (const f of helpFiles) {
  try {
    const txt = readFileSync(f, "utf8");
    const hits = countStaticArrays(txt);
    if (hits.length) {
      staticCopies += hits.length;
      offenders.push([f, hits.length]);
    }
  } catch { /* noop */ }
}

/* 统计 registry / defaults 的快捷键条目数（作为参考基线） */
let baseline = 0;
const refSource = existsSync(DEFAULTS) ? readFileSync(DEFAULTS, "utf8") : existsSync(REGISTRY) ? readFileSync(REGISTRY, "utf8") : "";
const idMatches = refSource.match(/id\s*:\s*["'][^"']+["']/g);
baseline = idMatches ? idMatches.length : 0;

console.log(`[check-shortcut-consistency] baseline(registry/defaults ids)=${baseline}`);
console.log(`  HelpOS 静态快捷键数组块 = ${staticCopies}`);
if (offenders.length) {
  for (const [f, n] of offenders) console.log(`    - ${f.replace(ROOT + "/", "")}: ${n} 个可疑数组`);
}

// SLI-6 PASS：静态副本 == 0（除 registry 外，任何地方都禁止出现 ≥ 3 条连续 keys 字面量数组）
if (staticCopies > 0) {
  console.error(`[FAIL] SLI-6 违规：检测到 ${staticCopies} 处静态快捷键副本，请改为 ShortcutRegistry.getAllShortcuts()`);
  process.exit(1);
}
console.log("[PASS] check-shortcut-consistency — 未检测到静态快捷键副本");
process.exit(0);
