---

doc_type: task
prd_task_id: "YP-09-112"
title: "YP-09-112: 安全加固 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer, aier]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "112-基础设施-安全加固XSS防护.md"
tags: [security, xss, mermaid, hardening]

type: task
---

# YP-09-112: 安全加固 — 技术设计

> **版本**：v1.0 · **人天**：0.25d · **PRD**：[112-基础设施-安全加固XSS防护.md](../../prds/2026-09/112-基础设施-安全加固XSS防护.md)

---

## 1. 业务上下文

两处 XSS 攻击面需要加固：Mermaid 图表渲染和 HTML 实体解码。LLM 生成的内容不可信，必须假设攻击者可通过提示词注入控制 AI 回复。

**PRD**：[YP-09-112](../../prds/2026-09/112-基础设施-安全加固XSS防护.md)

## 2. 架构

### Mermaid 渲染安全

```typescript
// chat/utils.ts:162 — 修复前
mermaid.initialize?.({ startOnLoad: false, securityLevel: 'loose', theme: 'dark' });

// chat/utils.ts:162 — 修复后
mermaid.initialize?.({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' });
```

**Mermaid strict 模式下的行为**：
- HTML 标签 `<div>` → 转义为 `&lt;div&gt;`
- 事件处理器 `onclick` → 转义为纯文本
- `<script>` → 完全禁止
- 标准 Mermaid 语法（graph, sequenceDiagram, classDiagram 等）→ **不受影响**

### decodeHTMLEntities 安全化

```typescript
// utility-tools.ts:260 — 修复前
export function decodeHTMLEntities(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;        // ❌ HTML 解析器，可能触发事件
  return div.textContent || '';
}

// utility-tools.ts:260 — 修复后
export function decodeHTMLEntities(html: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;   // ✅ textarea 将内容视为纯文本
  return textarea.value;
}
```

**为什么 `<textarea>` 更安全**：

| 属性 | `<div>` | `<textarea>` |
|------|---------|-------------|
| HTML 解析 | 完整 HTML 解析器 | 纯文本容器 |
| `<script>` 执行 | 不执行（未插入 DOM） | 不执行 |
| `<img onerror>` | 可能触发（浏览器特定） | 不触发 |
| 实体解码 | ✓ | ✓ |
| 规范保证 | 弱 | 强（HTML spec 定义 textarea 为纯文本） |

## 3. 变更清单

| 文件 | 行号 | 变更 | 说明 |
|------|------|------|------|
| `chat/utils.ts` | 162 | `securityLevel: 'loose'` → `'strict'` | 一字符修改 |
| `shared/utility-tools.ts` | 260-264 | `div` → `textarea`，`textContent` → `value` | 两行修改 |

## 4. 关键决策

| 决策 | 理由 |
|------|------|
| `strict` 而非 `sandbox` | `sandbox` 需要 iframe，对 YiPet 的浮动窗口架构侵入性大；`strict` 足够覆盖所有已知攻击向量 |
| `textarea` 而非 DOMParser | `textarea.innerHTML` 是业界标准实体解码模式，零依赖，浏览器原生优化 |
| 不做 HTML sanitization | HTML sanitization（如 DOMPurify）是防御方案而非修复方案；修复根因更优 |

## 5. 验证

```bash
npm run typecheck    # ✓ 零类型错误
npm test             # ✓ 138/138 测试通过
npm run build        # ✓ 4 入口构建成功
```

手工验证：
- [ ] LLM 返回含 `<script>` 标签的 Mermaid 代码 → SVG 中标签被转义
- [ ] `decodeHTMLEntities('<img src=x onerror=alert(1)>')` → 纯文本输出，无弹窗