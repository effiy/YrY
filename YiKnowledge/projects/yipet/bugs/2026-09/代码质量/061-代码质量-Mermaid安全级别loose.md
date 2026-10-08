---
title: Mermaid安全级别设为loose允许潜在XSS
tags: [yipet, security, xss, bug]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: medium
priority: p1
---

# Mermaid 安全级别设为 loose 允许潜在 XSS

## 现象

`src/chat/utils.ts` 中 Mermaid 初始化时使用 `securityLevel: 'loose'`，允许图表中的任意 HTML/CSS/JavaScript 执行。

## 复现

若 LLM 返回包含恶意 Mermaid 代码的消息（例如在节点标签中嵌入 `<script>` 标签或 `onclick` 处理器），`loose` 模式下 Mermaid 会原样渲染这些内容到 SVG 中，可能导致 XSS 攻击。

## 根因分析

```typescript
// 修复前
mermaid.initialize?.({ startOnLoad: false, securityLevel: 'loose', theme: 'dark' });
```

Mermaid 的安全级别分为：
- **strict**: HTML 标签被转义，禁止脚本执行
- **loose**: 允许 HTML 标签，存在 XSS 风险
- **antiscript**: 移除 script 标签但保留其他 HTML
- **sandbox**: 使用 iframe sandbox 隔离（最安全）

项目使用 `loose` 级别没有明确的业务需求（Mermaid 图表不需要内嵌 HTML），应使用 `strict`。

## 涉及文件

- `YiPet/src/chat/utils.ts:162` — Mermaid 初始化调用

## 修复方案

将安全级别从 `loose` 改为 `strict`：

```diff
- mermaid.initialize?.({ startOnLoad: false, securityLevel: 'loose', theme: 'dark' });
+ mermaid.initialize?.({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' });
```

Mermaid 图表渲染功能不受影响 — `strict` 模式仅对 HTML 标签进行转义，不影响标准 Mermaid 语法。

## 验证

- `npx tsc --noEmit` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓