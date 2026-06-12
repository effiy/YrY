---
paths:
  - "lib/**/*.mjs"
  - "skills/**/*.mjs"
  - "skills/**/*.js"
  - "agents/**/*.md"
  - "rules/**/*.md"
---

# code-paradigm — 代码编程范式约束

> YrY 代码基线。每一条都是可 grep 验证的硬约束，不是风格建议。
>
> 架构级范式定义见 [architecture-principles.md](./architecture-principles.md#代码范式约束)。本文件提供具体代码示例与反例。

[模块范式](#模块范式) · [函数范式](#函数范式) · [错误处理范式](#错误处理范式) · [导入范式](#导入范式) · [常量范式](#常量范式) · [审查速查](#审查速查)

---

## 模块范式

### ES 模块 + 具名导出

```javascript
// ✅ 正确：ES 模块，具名导出
import { join } from "node:path";
import { HEALTH_DIM_WEIGHTS } from "../../lib/constants.mjs";

export function calculateHealth(scores) {
  return Object.entries(scores).reduce((sum, [dim, score]) => {
    return sum + score * (HEALTH_DIM_WEIGHTS[dim] || 0);
  }, 0);
}

export const DEFAULT_THRESHOLD = 50;
```

```javascript
// ❌ 错误：CommonJS + 默认导出
const path = require("path");
module.exports = function calculateHealth(scores) { ... };
```

```javascript
// ❌ 错误：默认导出
export default function calculateHealth(scores) { ... }
```

**验证命令**：
```bash
grep -r "export default" lib/ --include="*.mjs"  # 返回空
grep -r "require(" lib/ skills/ --include="*.mjs"  # 返回空
```

### 禁止 class / extends

```javascript
// ✅ 正确：纯函数 + 组合
function createValidator(rules) {
  return function validate(value) {
    return rules.every((rule) => rule(value));
  };
}

function withTimeout(fn, ms) {
  return async function (...args) {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
    ]);
  };
}
```

```javascript
// ❌ 错误：class 定义 + 继承
class BaseValidator {
  constructor(rules) { this.rules = rules; }
  validate(value) { return this.rules.every((r) => r(value)); }
}

class StrictValidator extends BaseValidator {
  validate(value) { return super.validate(value) && value !== null; }
}
```

```javascript
// ❌ 错误：即使不用 extends，class 本身也不符合组合范式
class HealthChecker {
  constructor(config) { this.config = config; }
  check() { ... }
}
```

**验证命令**：
```bash
grep -r "\bclass\b\|\bextends\b" lib/ skills/ --include="*.mjs"  # 返回空
```

---

## 函数范式

### 纯函数优先

```javascript
// ✅ 正确：纯函数 — 相同输入 = 相同输出，无副作用
export function computeGrade(score) {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function mergeScores(core, em) {
  return { ...core, ...em };
}
```

```javascript
// ❌ 错误：有副作用的"纯计算"函数
export function computeGrade(score) {
  console.log(`computing grade for ${score}`);  // 副作用：日志
  lastComputed = score;                          // 副作用：修改外部状态
  if (score >= 90) return "A";
  ...
}
```

```javascript
// ⚠️ 允许：I/O 函数名明确标注行为
export function writeReportFile(path, content) { ... }  // "write" = 副作用
export function fetchApiData(url) { ... }               // "fetch" = 副作用
export async function sendNotification(msg) { ... }      // "send" = 副作用
```

### 函数尺寸约束

```javascript
// ✅ 正确：小函数，单一职责
export function parseHealthEntry(line) {
  try { return JSON.parse(line); } catch { return null; }
}

export function filterValidEntries(entries) {
  return entries.filter((e) => e && typeof e.composite === "number");
}

export function computeAverageScore(entries) {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((a, e) => a + e.composite, 0);
  return Math.round(sum / entries.length);
}
```

```javascript
// ❌ 错误：单一函数做三件事（解析 + 过滤 + 计算）
export function processHealthData(raw) {
  const entries = raw.split("\n").map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
  const valid = entries.filter((e) => typeof e.composite === "number");
  const avg = valid.reduce((a, e) => a + e.composite, 0) / valid.length;
  return { entries, valid, avg };
}
```

| 约束 | 阈值 | 超阈值处理 |
|------|------|-----------|
| 函数行数 | ≤ 60 行 | 拆分为 ≥2 个小函数 |
| 参数个数 | ≤ 4 个 | 合并为对象参数 `{a, b, c}` |
| 嵌套深度 | ≤ 3 层 | 提取中间函数或 early return |

### 参数规范

```javascript
// ✅ 正确：≤4 个参数
export function sendMessage(webhookUrl, content, options = {}) {
  const { timeout = 5000, retries = 3, format = "text" } = options;
  ...
}

// ✅ 正确：>4 个参数时用对象
export function createReport({ title, sections, data, outputPath, template, style }) {
  ...
}

// ❌ 错误：>4 个位置参数
export function createReport(title, sections, data, outputPath, template, style) {
  ...
}
```

---

## 错误处理范式

### 显式处理，禁止空 catch

```javascript
// ✅ 正确：显式错误处理
try {
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data);
} catch (err) {
  if (err.code === "ENOENT") {
    return defaultValue;
  }
  throw new Error(`读取配置失败 ${path}: ${err.message}`);
}
```

```javascript
// ❌ 错误：空 catch 块 — 静默失败
try {
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data);
} catch (err) {
  // 什么都不做，调用方不知道失败了
}
```

```javascript
// ❌ 错误：吞掉所有错误但不处理
try {
  return JSON.parse(data);
} catch {
  return {};  // 静默返回空对象，掩盖数据格式问题
}
```

### 错误传播链

```javascript
// ✅ 正确：有意义的错误上下文
export function loadConfig(projectRoot) {
  const configPath = join(projectRoot, ".claude", "settings.json");
  try {
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch (err) {
    throw new Error(`无法加载配置 ${configPath}: ${err.message}`, { cause: err });
  }
}
```

```javascript
// ❌ 错误：丢失原始错误信息
try {
  return loadConfig(root);
} catch (err) {
  throw new Error("配置加载失败");  // err 被丢弃
}
```

**验证命令**：
```bash
# 空 catch 块检查
grep -r "catch\s*{\s*}" lib/ --include="*.mjs"  # 返回空
grep -r "catch\s*(\w*)\s*{\s*}" lib/ --include="*.mjs" | grep -v "err\|error\|e"  # catch 变量未使用
```

---

## 导入范式

### 导入优先级排序

```javascript
// ✅ 正确：按优先级分组，空行分隔
// 1. Node.js 内置模块
import { join, dirname } from "node:path";
import { existsSync, readFileSync } from "node:fs";

// 2. 项目 lib/ 共享库
import { HEALTH_DIM_WEIGHTS, MAX_RETRIES } from "../../lib/constants.mjs";
import { findProjectRoot, readJsonl } from "../../lib/fs.mjs";

// 3. 本 skill 内部模块
import { formatMessage } from "./lib/format.mjs";
import { validateInput } from "./lib/validate.mjs";

// 4. 第三方依赖（罕见）
// import { something } from "external-pkg";
```

```javascript
// ❌ 错误：导入顺序混乱
import { formatMessage } from "./lib/format.mjs";
import { join } from "node:path";
import { HEALTH_DIM_WEIGHTS } from "../../lib/constants.mjs";
import { existsSync } from "node:fs";
```

### 禁止跨 Skill 直接导入

```javascript
// ✅ 正确：通过 lib/ 共享库通信
import { sendNotification } from "../../lib/network.mjs";

// ❌ 错误：跨 Skill 直接导入
import { checkHealth } from "../../skills/rui-health/lib/check.mjs";
```

**验证命令**：
```bash
grep -r "from.*skills/" skills/ --include="*.mjs"  # 返回空
grep -r "from.*skills/" agents/ --include="*.md"  # 返回空
```

---

## 常量范式

### 禁止魔法数字

```javascript
// ✅ 正确：语义化常量
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const POLL_INTERVAL_MS = 3_000;
const MAX_RETRY_COUNT = 3;

if (response.status === HTTP_OK) { ... }
setTimeout(checkStatus, POLL_INTERVAL_MS);
```

```javascript
// ❌ 错误：魔法数字
if (response.status === 200) { ... }       // 200 是什么？
setTimeout(checkStatus, 3000);              // 3000 是什么？
for (let i = 0; i < 3; i++) { retry(); }   // 3 是什么？
```

### 豁免：惯用值

```javascript
// ✅ 允许：循环/索引/初始化的惯用值
for (let i = 0; i < items.length; i++) { ... }   // 循环索引 0
const found = items.indexOf(target);
if (found === -1) { ... }                         // 未找到惯例 -1
const result = value + 1;                         // +1 偏移
const doubled = count * 2;                        // *2 翻倍（自解释）
const isEmpty = list.length === 0;                // 长度比较 0
const first = items[0];                           // 首位元素 0
```

### 数字字面量 → 语义化常量速查

| 原始写法 | 应替换为 |
|---------|---------|
| `setTimeout(fn, 30000)` | `setTimeout(fn, HTTP_TIMEOUT_MS)` |
| `status === 200` | `status === HTTP_OK` |
| `for (let i = 0; i < 3; i++)` | `for (let i = 0; i < MAX_RETRIES; i++)` |
| `score < 40` | `score < SCORE_THRESHOLD_WARN` |
| `.slice(0, 5)` | `.slice(0, RECENT_WINDOW_SIZE)` |
| `if (rate > 0.5)` | `if (rate > P0_DENSITY_THRESHOLD)` |
| `retryDelay = 1000` | `retryDelay = RETRY_DELAY_MS` |

### 常量归属

```javascript
// ✅ 项目级常量 → lib/constants.mjs
export const MAX_RETRIES = 3;
export const HTTP_TIMEOUT_MS = 30_000;

// ✅ Skill 级常量 → skill 内部
// skills/rui-bot/lib/format.mjs
export const STATUS_EMOJI = { complete: "✅", blocked: "🚫" };

// ✅ 函数内局部常量 → 函数作用域
function parseArgs() {
  const NODE_ARGV_OFFSET = 2;  // 仅此函数使用
  return process.argv.slice(NODE_ARGV_OFFSET);
}

// ❌ 错误：跨文件重复定义
// lib/a.mjs: export const MAX_RETRIES = 3;
// lib/b.mjs: export const MAX_RETRIES = 3;  // DRY 冲突！应从 lib/constants.mjs 导入
```

**验证命令**：
```bash
# 检查 lib/ 中的重复 export 定义
node lib/arch-check.mjs --dim dry
```

---

## 审查速查

> 代码审查时逐条对照。每一条都有对应的 grep 命令。

| # | 约束 | grep 命令 | 目标 |
|---|------|----------|------|
| 1 | ES 模块 | `grep -r "require(" lib/ skills/ --include="*.mjs"` | 返回空 |
| 2 | 具名导出 | `grep -r "export default" lib/ --include="*.mjs"` | 返回空 |
| 3 | 无 class | `grep -r "\bclass\b\|\bextends\b" lib/ skills/ --include="*.mjs"` | 返回空 |
| 4 | 无魔法数字 | 代码审查 — 数字字面量是否赋予语义化常量名 | 仅 0/1/-1 豁免 |
| 5 | 纯函数 | 代码审查 — lib/ 函数是否有 I/O 副作用 | I/O 函数名明确标注 |
| 6 | 空 catch | `grep -r "catch\s*{\s*}" lib/ skills/ --include="*.mjs"` | 返回空 |
| 7 | 无跨 Skill 导入 | `grep -r "from.*skills/" skills/ --include="*.mjs"` | 返回空 |
| 8 | 导入顺序 | 代码审查 — Node 内置 → lib/ → 内部 → 第三方 | 分组间有空行 |
| 9 | 函数尺寸 | 代码审查 — ≤60 行 / ≤4 参数 / ≤3 层嵌套 | 超阈值需拆分 |
| 10 | 常量归位 | 代码审查 — 同一定义出现 ≥2 次 → 提取 | 项目级 → constants.mjs |

---

## 生效标志

| 标志 | 验证方式 |
|------|---------|
| 无 class/extends | `node lib/arch-check.mjs --dim arch_paradigm` 通过 |
| 无 export default | 同上 |
| 无空 catch 块 | 同上 |
| 无跨 skill 导入 | `grep -r "from.*skills/" skills/ --include="*.mjs"` 返回空 |
| 无魔法数字 | 代码审查持续进行 |

---

> 本文件的每一条约束都有对应的 grep 命令或 arch-check 维度。不可验证的约束不写进本文件。
