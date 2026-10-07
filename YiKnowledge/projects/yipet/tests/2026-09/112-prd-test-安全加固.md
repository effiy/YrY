---

doc_type: test
prd_test_id: "YP-09-112"
title: "YP-09-112: 安全加固 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer, aier]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "112-基础设施-安全加固XSS防护.md"
tags: [security, xss, mermaid, testing]

type: test
---

# YP-09-112: 安全加固 — 测试方案

> **版本**：v1.0 · **PRD**：[112-基础设施-安全加固XSS防护.md](../../prds/2026-09/112-基础设施-安全加固XSS防护.md)

---

## 1. 测试策略

| 层级 | 方法 | 覆盖目标 |
|------|------|----------|
| 静态分析 | `vue-tsc --noEmit` | 零类型错误 |
| 代码审查 | grep/read | 确认配置值 |
| XSS 向量测试 | 手工 PoC | 确认攻击向量被缓解 |
| 回归测试 | Vitest 138 tests | 零回归 |

## 2. 测试用例

### TC-01: Mermaid securityLevel 代码审查

```bash
grep "securityLevel" src/chat/utils.ts
```

**预期**: 输出包含 `securityLevel: 'strict'`，不包含 `'loose'`

### TC-02: Mermaid XSS — script 标签注入

```
输入 Mermaid 代码:
graph TD
    A["<script>alert('xss')</script>"] --> B[Node]

预期渲染:
  SVG 中显示 &lt;script&gt;alert('xss')&lt;/script&gt;
  无 alert 弹窗
```

### TC-03: Mermaid XSS — onclick 事件处理器注入

```
输入 Mermaid 代码:
graph TD
    A["<a onclick='alert(1)'>click</a>"] --> B

预期渲染:
  SVG 中显示 &lt;a onclick='alert(1)'&gt;click&lt;/a&gt;
  无事件处理器生效
```

### TC-04: Mermaid 标准语法不受影响

```
输入标准 Mermaid 语法:
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Fail]

预期: 图表正常渲染，箭头、节点、标签均正确
```

### TC-05: decodeHTMLEntities 代码审查

```bash
grep -A3 "decodeHTMLEntities" src/shared/utility-tools.ts
```

**预期**: 使用 `document.createElement('textarea')`，不使用 `document.createElement('div')`

### TC-06: decodeHTMLEntities — 基本功能

```
输入: '&lt;div&gt;Hello&lt;/div&gt;'
预期输出: '<div>Hello</div>'
```

### TC-07: decodeHTMLEntities — XSS 向量

```
输入: '<img src=x onerror=alert(1)>'
预期输出: '<img src=x onerror=alert(1)>' (纯文本，无弹窗)
行为: 无 alert 触发
```

### TC-08: decodeHTMLEntities — script 标签

```
输入: '<script>alert("xss")</script>'
预期输出: '<script>alert("xss")</script>' (纯文本)
行为: 无脚本执行
```

### TC-09: decodeHTMLEntities — 特殊字符

```
输入: '&amp;lt;&amp;gt;&amp;quot;&amp;#39;&amp;amp;'
预期输出: '&lt;&gt;"\'&amp;'
```

## 3. XSS 向量覆盖矩阵

| 向量 | Mermaid (strict) | decodeHTMLEntities (textarea) |
|------|-----------------|------------------------------|
| `<script>alert(1)</script>` | 转义 | 不执行 |
| `<img src=x onerror=alert(1)>` | 转义 | 不触发 onerror |
| `<a onclick="alert(1)">` | 转义 | 不触发 onclick |
| `<div onmouseover="alert(1)">` | 转义 | 不触发 |
| `<iframe src="javascript:alert(1)">` | 转义 | 不创建 iframe |
| 标准 Mermaid 语法 | ✅ 正常 | N/A |
| 标准 HTML 实体 `&lt;` | N/A | ✅ 正确解码 |

## 4. 自动化验证

```
npm run typecheck    # ✓
npm test             # ✓ 138/138
npm run build        # ✓
```

## 5. 测试结果

```
=== 代码审查 ===
securityLevel              ✓ 'strict' (was 'loose')
decodeHTMLEntities impl    ✓ textarea (was div)

=== XSS PoC ===
TC-02 Mermaid script 注入  ✓ 已转义
TC-03 Mermaid onclick 注入  ✓ 已转义
TC-04 Mermaid 标准语法     ✓ 正常
TC-07 decodeHTMLEntities XSS ✓ 纯文本
TC-08 decodeHTMLEntities script ✓ 纯文本

=== 自动化 ===
vue-tsc    ✓ 零错误
vitest     ✓ 138/138
build      ✓
```