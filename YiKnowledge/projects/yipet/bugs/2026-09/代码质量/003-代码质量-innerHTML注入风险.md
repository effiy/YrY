---
title: Mermaid SVG 和更新横幅使用 innerHTML 注入 DOM
tags: [yipet, code-quality, security]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# Mermaid SVG 和更新横幅使用 innerHTML 注入 DOM

## 现象

YiPet 中有 3 处使用 `innerHTML` 直接设置 DOM 内容：

1. **`chat/utils.ts:103`** — Mermaid 渲染 SVG 注入
```typescript
const { svg } = await mermaid.render(`yipet-mmd-${++_mermaidSeq}`, code);
el.innerHTML = svg;  // 直接注入 mermaid 生成的 SVG
```

2. **`chat/utils.ts:114`** — `escapeHtml` 函数使用 `innerHTML` 读取
```typescript
div.textContent = s;
return div.innerHTML;  // 利用浏览器转义做 HTML 编码
```

3. **`content/rendering/overlay.ts:886`** — 更新通知横幅
```typescript
banner.innerHTML = '<div>...<button onclick="location.reload()">...</div>';
```

## 根因分析

- Mermaid 库生成的 SVG 来自用户提供的 markdown 中的 mermaid 代码块——虽然 mermaid 本身会消毒，但攻击面仍然存在
- 更新横幅使用了 `onclick` 内联事件处理器，这是 CSP 通常禁止的模式（虽然 MV3 扩展的 CSP 更宽松）
- `escapeHtml` 的实现依赖浏览器 textContent 行为，实际上可靠但语义不清晰

## 涉及文件

- `src/chat/utils.ts:103,114` — Mermaid SVG 注入 + escapeHtml 读取
- `src/content/rendering/overlay.ts:886` — 更新横幅 innerHTML

## 修复方案

1. Mermaid SVG：使用 `DOMParser.parseFromString(svg, 'image/svg+xml')` 验证 SVG 合法性后再用 `appendChild` 插入
2. 更新横幅：使用 `document.createElement` + `textContent` 构建 DOM，用 `addEventListener` 替代 `onclick`
3. `escapeHtml`：直接用 `textContent` 赋值替代 innerHTML 模式


## 影响范围

**影响模块**：`src/chat/utils.ts`（Mermaid 渲染）、`src/content/rendering/overlay.ts`（更新横幅）。
**影响用户**：如果 Mermaid 图表包含恶意脚本（通过用户提供的 Markdown 注入），可能导致 XSS 攻击。
**影响范围**：所有使用 Mermaid 渲染的聊天消息和扩展更新通知横幅。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | ESLint 规则 `no-unsanitized/property` 禁止直接 `innerHTML` 赋值 | DevOps |
| 代码 | 所有动态 DOM 插入必须通过 `createElement` + `appendChild` 或使用 `DOMParser` 消毒 | 开发者 |
| 代码 | `onclick` 等内联事件处理器替换为 `addEventListener` | 开发者 |
| 安全 | 用户提供的 Markdown 内容在渲染前需经过 HTML 消毒处理 | 安全团队 |


## 经验教训

在浏览器扩展中，Content Script 运行在 ISOLATED World，但通过 `innerHTML` 注入的内容仍在 MAIN World 的 DOM 中执行。即使扩展自身代码安全，用户提供的 Markdown 内容（如 Mermaid 图表代码）仍可能成为 XSS 攻击向量。DOM API 提供了更安全的替代方案（`createElement`、`textContent`），应始终优先使用。
