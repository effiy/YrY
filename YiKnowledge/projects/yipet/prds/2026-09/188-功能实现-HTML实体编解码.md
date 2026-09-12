---
title: "YP-09-181: HTML实体编解码 — 所有命名实体支持、数字实体转换（十进制/十六进制）、批量编解码、结果复制、安全HTML预览"
tags: [需求文档, HTML实体, 编解码, 命名实体, 数字实体, XSS防护, 安全预览, 开发者工具]
category: 项目/浏览器扩展/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已完成
priority: P2
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202609"
prd_task_id: YP-09-181
estimate_frontend: 0.2
review_status: 待评审
issue_type: 功能实现
roles: [engineer]
---

# YP-09-181: HTML实体编解码 — 所有命名实体支持、数字实体转换（十进制/十六进制）、批量编解码、结果复制、安全HTML预览

> 需求编号：YP-09-181 · 优先级：P2 · 人天：0.2d · 状态：需求已编写
> 依赖：无

## 背景

### 问题陈述

HTML 实体编解码是前端开发和内容处理中的高频基础操作。开发者在编写 HTML/CSS 内容、处理富文本、转义用户输入、分析爬虫数据时，频繁需要对 HTML 实体进行编码和解码。然而，当前缺乏一个好用的本地工具：

1. **浏览器 `textarea` 自动解码**：粘贴 `&lt;script&gt;` 到 textarea 中，浏览器会自动渲染为 `<script>`，导致原始实体字符串丢失
2. **命名实体记忆困难**：HTML 有 2000+ 命名实体（`&amp;`、`&lt;`、`&copy;`、`&rarr;` 等），开发者难以记住全部
3. **数字实体转换不便**：十进制 `&#60;` 与十六进制 `&#x3C;` 互转，以及它们与命名实体 `&lt;` 的对应关系，需要查表
4. **批量编解码缺失**：一次编码/解码多个实体需要逐个替换
5. **安全预览风险**：解码 HTML 实体后的内容可能包含 `<script>` 等危险标签，直接渲染到页面可能导致 XSS

**核心矛盾**：HTML 实体编解码是 Web 开发的基础操作，但浏览器内置机制（textarea.value）会"吞掉"实体引用，导致用户无法直接观察和操作实体字符串。需要一个同时支持编解码、参考表和安全性保证的工具。

### 影响范围

| # | 影响 | 严重程度 | 典型场景 |
|---|------|----------|----------|
| 1 | 编码操作不变 | 高 | 每次需要转义 HTML 特殊字符或 Emoji |
| 2 | 解码结果被浏览器吞掉 | 高 | 粘贴 `&amp;` 到 textarea 自动变成 `&` |
| 3 | 命名实体查询困难 | 中 | 想用 `&rarr;` 但忘了怎么拼 |
| 4 | 数字实体转换不便 | 中 | `&#x1F600;` 到底是什么字符？ |
| 5 | XSS 风险 | 中 | 解码用户输入的 HTML 实体后直接渲染 |

### 挑战

| 挑战 | 说明 |
|------|------|
| 实体映射表体积 | 2000+ 命名实体，需加载完整的实体映射表 |
| 浏览器自动解码 | textarea 会自动解码 HTML 实体，需使用特殊方式保留原始文本 |
| 数字实体范围 | Unicode 码点范围 0x0000-0x10FFFF，需正确处理 BMP 外字符 |
| 安全渲染 | 解码后的 HTML 可能含脚本，需在隔离环境中预览 |
| 批量操作性能 | 10000+ 字符的文本中替换所有实体，保证不用正则回溯导致超时 |

---

## 一、现状分析

### 1.1 当前 HTML 实体处理流程

```
用户需要处理 HTML 实体
  │
  ├─ 编码特殊字符
  │   ├─ 打开在线 HTML Entity Encoder
  │   │   或手动替换 & → &amp;、< → &lt;、> → &gt;、" → &quot;
  │   └─ 效率极低，容易遗漏
  │
  ├─ 解码 HTML 实体
  │   ├─ 打开浏览器 Console
  │   ├─ 创建临时 DOM 元素: var d=document.createElement('div'); d.innerHTML='...'; d.textContent
  │   └─ textarea.value 也会自动解码但无法看到原始实体
  │
  ├─ 查找命名实体
  │   ├─ 搜索 "HTML entities list"
  │   ├─ 在长列表中肉眼查找
  │   └─ 耗时且易出错
  │
  └─ 预览渲染结果
      ├─ 手动创建 HTML 文件
      ├─ 在浏览器中打开
      └─ 担心 XSS 风险
```

### 1.2 当前可用能力

| 能力 | 可用性 | 获取方式 | 限制 |
|------|--------|----------|------|
| 文本编码 | ⚠️ | 手动 replace | 仅覆盖常用 5 个实体，易遗漏 |
| 文本解码 | ⚠️ | textarea.value | 自动解码，无法查看原始实体字符串 |
| 命名实体查询 | ❌ | 在线查表 | 无搜索/过滤功能 |
| 数字实体转换 | ❌ | 手动计算 | 需要 Unicode 码点知识 |
| HTML 安全预览 | ⚠️ | iframe sandbox | 需手动构建 |

### 1.3 根因矩阵

| 症状 | 根因 | 触发条件 | 频率 |
|------|------|----------|------|
| 编码易遗漏 | 手动 replace 不完整 | 编码含多种特殊字符的文本 | 高 |
| 解码不便 | textarea 自动解码 | 需要观察和分析实体字符串时 | 高 |
| 实体查找困难 | 2000+ 实体无结构化索引 | 需要特定名称或符号的实体 | 中 |
| 数字转换低效 | 需手动计算码点 | 十六进制转十进制或不反向 | 中 |
| 预览有 XSS 风险 | 直接 innerHTML 渲染 | 解码不可信来源的 HTML | 中 |

---

## 二、设计决策

### 决策 1：实体映射表来源 — 硬编码常用实体 vs 完整 HTML5 规范 vs 按需加载

| 选项 | 覆盖度 | 体积 | 查询速度 |
|------|--------|------|----------|
| 硬编码 200+ 常用实体 | 80% 使用场景 | ~2KB | 极快 |
| 完整 HTML5 命名实体（2231 个） | 100% | ~40KB | 快 |
| 按需从 CDN 加载完整表 | 100% | ~40KB（懒加载） | 中等 |

**选择：完整 HTML5 命名实体表（预置）。** 40KB 对 Chrome 扩展来说是可接受的体积（压缩后约 10KB）。完整的实体表保证所有合法实体都能正确编解码，避免"为什么这个实体不支持"的问题。使用 Map 数据结构保证 O(1) 查询。

### 决策 2：编解码策略 — 仅命名实体 vs 命名+数字实体 vs 全部支持

| 选项 | 场景覆盖 | 实现复杂度 | 输出选择性 |
|------|----------|-----------|-----------|
| 仅命名实体 | 50% | 低 | 低 |
| 命名 + 十进制数字 | 80% | 中 | 中 |
| 命名 + 十进制 + 十六进制 | 100% | 中 | 高 |

**选择：三种模式均支持，用户可选。** 编码时可选择输出格式：命名实体优先（`&lt;`）、十进制数字（`&#60;`）、十六进制数字（`&#x3C;`）。解码时自动识别所有三种格式。

### 决策 3：安全预览策略 — 直接 innerHTML vs iframe sandbox vs Shadow DOM

| 选项 | 安全性 | 隔离度 | 实现复杂度 |
|------|--------|--------|-----------|
| innerHTML + DOMPurify | 高 | 中 | 低 |
| iframe sandbox | 最高 | 最高 | 中 |
| Shadow DOM | 中 | 中 | 低 |

**选择：iframe sandbox + DOMPurify 双重保护。** iframe sandbox="allow-same-origin" 阻止脚本执行，DOMPurify 在注入前清除所有危险标签和事件处理器。Shadow DOM 的 CSS 隔离作为附加层（防止预览内容影响工具页面样式）。

### 决策 4：文本编辑区防自动解码 — contenteditable div vs textarea + 实时编码 vs CodeMirror

| 选项 | 防自动解码 | 编辑体验 | 实现复杂度 |
|------|-----------|----------|-----------|
| contenteditable div（innerText 读写） | 是 | 中 | 低 |
| textarea + 实时编码存储 | 是（存储层） | 好 | 中 |
| CodeMirror/Monaco | 是 | 最好 | 高 |

**选择：contenteditable div + 双存储。** 编辑区使用 contenteditable div（innerText 不会像 textarea.value 那样自动解码），内部维护编码后的原始字符串和渲染文本的映射。轻量且可靠。

### 设计决策记录

| 决策 | 选项 A | 选项 B | 选项 C | 选择 | 理由 |
|------|--------|--------|--------|------|------|
| 实体映射表 | 200常用 | 完整2231 | CDN懒加载 | **完整2231** | 40KB可接受，100%覆盖 |
| 编解码策略 | 仅命名 | 命名+十进制 | 三种全支持 | **三种全支持** | 用户可选输出格式 |
| 安全预览 | innerHTML | iframe sandbox | Shadow DOM | **iframe+DOMPurify** | 最高安全性 |
| 防自动解码 | contenteditable | textarea+存储 | CodeMirror | **contenteditable** | 轻量可靠 |

---

## 三、目标架构

### 3.1 HTML 实体工具系统架构

```mermaid
graph TD
    subgraph "输入输出层"
        A1[EntityTool: 主界面]
        A2[EncodeInput: 编码输入区]
        A3[DecodeInput: 解码输入区]
        A4[EntityTable: 实体参考表]
        A5[SafePreview: 安全预览区]
    end

    subgraph "核心逻辑层"
        B1[EntityEncoder: 实体编码器]
        B2[EntityDecoder: 实体解码器]
        B3[EntityLookup: 实体查询]
        B4[HtmlEntities: 完整实体映射表]
        B5[SafetyFilter: 安全过滤器]
    end

    subgraph "渲染隔离层"
        C1[SandboxIframe: iframe sandbox]
        C2[DOMPurify: HTML 清洗]
    end

    A1 --> A2 & A3 & A4 & A5
    A2 --> B1
    A3 --> B2
    A4 --> B3
    B1 & B2 --> B4
    A5 --> B5
    B5 --> C2 --> C1
    A5 --> A5: 渲染清洗后的安全 HTML
```

### 3.2 编解码流程

```mermaid
graph TD
    A[用户输入文本] --> B{操作模式}
    B -->|编码| C[扫描所有可编码字符]
    C --> D{输出格式选择}
    D -->|命名实体优先| E[优先使用 &amp; &lt; &copy; 等]
    D -->|十进制| F[转换为 &#60; 格式]
    D -->|十六进制| G[转换为 &#x3C; 格式]
    E & F & G --> H[输出编码结果]

    B -->|解码| I[匹配所有实体模式]
    I --> J[命名实体: 查表替换]
    I --> K[十进制: parseInt 转换]
    I --> L[十六进制: parseInt(s, 16) 转换]
    J & K & L --> M[String.fromCodePoint 生成字符]
    M --> N[输出解码文本]
```

### 3.3 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 实体编码（1KB 文本） | < 5ms | Map 查找 + 字符串替换 |
| 实体解码（1KB 文本） | < 10ms | 正则匹配，200+ 实体扫描 |
| 实体表查询 | < 1ms | Map.get O(1) |
| 安全预览渲染 | < 50ms | DOMPurify + iframe srcdoc |
| 大文本编码（100KB） | < 100ms | 单次正则替换 |
| 实体参考表搜索 | < 20ms | 过滤 2231 条记录 |

---

## 四、具体改动

### 4.1 完整 HTML 实体映射表

```typescript
// src/tools/html-entities/HtmlEntities.ts (新增)

/**
 * HTML5 命名实体映射表
 * 来源: https://html.spec.whatwg.org/entities.json
 * 共 2231 个命名实体
 */
export const NAMED_ENTITIES: ReadonlyMap<string, string> = new Map([
  // 核心实体
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  // 常用符号
  ['nbsp', '\u00A0'],
  ['copy', '\u00A9'],
  ['reg', '\u00AE'],
  ['trade', '\u2122'],
  ['euro', '\u20AC'],
  ['pound', '\u00A3'],
  ['yen', '\u00A5'],
  ['cent', '\u00A2'],
  // 数学符号
  ['times', '\u00D7'],
  ['divide', '\u00F7'],
  ['plusmn', '\u00B1'],
  ['minus', '\u2212'],
  ['sup1', '\u00B9'],
  ['sup2', '\u00B2'],
  ['sup3', '\u00B3'],
  ['frac12', '\u00BD'],
  ['frac14', '\u00BC'],
  ['frac34', '\u00BE'],
  ['radic', '\u221A'],
  ['infin', '\u221E'],
  ['ne', '\u2260'],
  ['le', '\u2264'],
  ['ge', '\u2265'],
  // 箭头
  ['larr', '\u2190'],
  ['uarr', '\u2191'],
  ['rarr', '\u2192'],
  ['darr', '\u2193'],
  ['harr', '\u2194'],
  ['crarr', '\u21B5'],
  ['lArr', '\u21D0'],
  ['uArr', '\u21D1'],
  ['rArr', '\u21D2'],
  ['dArr', '\u21D3'],
  // 标点
  ['laquo', '\u00AB'],
  ['raquo', '\u00BB'],
  ['lsquo', '\u2018'],
  ['rsquo', '\u2019'],
  ['ldquo', '\u201C'],
  ['rdquo', '\u201D'],
  ['ndash', '\u2013'],
  ['mdash', '\u2014'],
  ['hellip', '\u2026'],
  // 技术符号
  ['larrb', '\u21E4'],
  ['rarrb', '\u21E5'],
  // ... 完整列表共 2231 个实体
]);

/** 反向映射: 字符 → 实体名称（取最短名称） */
export const CHAR_TO_ENTITY: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [name, char] of NAMED_ENTITIES) {
    const existing = map.get(char);
    if (!existing || name.length < existing.length) {
      map.set(char, name);
    }
  }
  return map;
})();

/** 始终编码的特殊 HTML 字符 */
const ALWAYS_ENCODE = new Map<string, string>([
  ['&', 'amp'],
  ['<', 'lt'],
  ['>', 'gt'],
  ['"', 'quot'],
]);
```

### 4.2 实体编码器

```typescript
// src/tools/html-entities/EntityEncoder.ts (新增)

export type EncodeMode = 'named' | 'decimal' | 'hex';

export class EntityEncoder {
  /**
   * 编码文本中的 HTML 特殊字符
   * @param text 原始文本
   * @param mode 编码模式: named/decimal/hex
   * @param encodeAll 是否编码所有可编码字符（默认仅编码 & < > " '）
   */
  encode(text: string, mode: EncodeMode = 'named', encodeAll = false): string {
    let result = '';

    for (const char of text) {
      const codePoint = char.codePointAt(0);
      if (codePoint === undefined) {
        result += char;
        continue;
      }

      // 始终编码的 4 个特殊字符
      if (ALWAYS_ENCODE.has(char)) {
        result += this.formatEntity(ALWAYS_ENCODE.get(char)!, codePoint, mode);
        continue;
      }

      // 编码所有匹配命名实体的字符
      if (encodeAll && CHAR_TO_ENTITY.has(char)) {
        const entityName = CHAR_TO_ENTITY.get(char)!;
        result += this.formatEntity(entityName, codePoint, mode);
        continue;
      }

      // 如果设置了 encodeAll，编码所有非 ASCII 字符
      if (encodeAll && codePoint > 127) {
        result += this.formatEntity(null, codePoint, mode);
        continue;
      }

      result += char;
    }

    return result;
  }

  private formatEntity(
    name: string | null,
    codePoint: number,
    mode: EncodeMode,
  ): string {
    switch (mode) {
      case 'named':
        return name ? `&${name};` : `&#${codePoint};`;
      case 'decimal':
        return `&#${codePoint};`;
      case 'hex':
        return `&#x${codePoint.toString(16).toUpperCase()};`;
    }
  }
}
```

### 4.3 实体解码器

```typescript
// src/tools/html-entities/EntityDecoder.ts (新增)

export class EntityDecoder {
  private readonly entityPattern = /&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]\w*));/g;

  decode(text: string): string {
    return text.replace(this.entityPattern, (match, decimal, hex, named) => {
      // 数字实体（十进制）
      if (decimal !== undefined) {
        const cp = parseInt(decimal, 10);
        return this.codePointToChar(cp);
      }

      // 数字实体（十六进制）
      if (hex !== undefined) {
        const cp = parseInt(hex, 16);
        return this.codePointToChar(cp);
      }

      // 命名实体
      if (named !== undefined && NAMED_ENTITIES.has(named)) {
        return NAMED_ENTITIES.get(named)!;
      }

      // 未识别的实体，保留原样
      return match;
    });
  }

  private codePointToChar(cp: number): string {
    if (cp > 0x10FFFF || cp < 0) return `&#${cp};`;
    try {
      return String.fromCodePoint(cp);
    } catch {
      return `&#${cp};`;
    }
  }
}
```

### 4.4 安全预览

```typescript
// src/tools/html-entities/SafePreview.ts (新增)

import DOMPurify from 'dompurify';

export class SafePreview {
  private sanitizer: typeof DOMPurify;

  constructor() {
    // 配置 DOMPurify：仅允许安全的 HTML 标签和属性
    this.sanitizer = DOMPurify;
  }

  /**
   * 在 sandbox iframe 中安全渲染 HTML 内容
   * @param html 原始 HTML 内容（可能含脚本）
   * @param container 挂载 iframe 的容器元素
   */
  renderSafe(html: string, container: HTMLElement): HTMLIFrameElement {
    // 移除旧 iframe
    const existing = container.querySelector('iframe');
    if (existing) existing.remove();

    // 创建 sandbox iframe
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-same-origin');
    iframe.style.cssText = 'width:100%;min-height:200px;border:1px solid #ddd;border-radius:4px;';

    container.appendChild(iframe);

    // 清洗 HTML 并注入
    const clean = this.sanitizer.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead',
        'tbody', 'tr', 'td', 'th', 'span', 'div', 'code', 'pre', 'blockquote'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
    });

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>
        body { font-family: system-ui; padding: 12px; color: #333; }
        img { max-width: 100%; }
      </style></head><body>${clean}</body></html>`);
      doc.close();
    }

    return iframe;
  }
}
```

### 4.5 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/tools/html-entities/types.ts` | 新增 | 类型定义 |
| `src/tools/html-entities/HtmlEntities.ts` | 新增 | 完整实体映射表（2231 个） |
| `src/tools/html-entities/EntityEncoder.ts` | 新增 | 实体编码器 |
| `src/tools/html-entities/EntityDecoder.ts` | 新增 | 实体解码器 |
| `src/tools/html-entities/EntitySearch.ts` | 新增 | 实体搜索（按名称/字符/码点） |
| `src/tools/html-entities/SafePreview.ts` | 新增 | 安全 HTML 预览 |
| `src/popup/components/EntityTool.vue` | 新增 | 主界面（Tab 切换） |
| `src/popup/components/EntityEncodePanel.vue` | 新增 | 编码面板 |
| `src/popup/components/EntityDecodePanel.vue` | 新增 | 解码面板 |
| `src/popup/components/EntityReferenceTable.vue` | 新增 | 实体参考表 |
| `src/popup/components/EntitySearchBar.vue` | 新增 | 实体搜索栏 |
| `src/popup/components/EntityPreviewFrame.vue` | 新增 | 安全预览组件 |
| `src/popup/App.vue` | 修改 | 添加实体工具入口 |
| `package.json` | 修改 | 添加 dompurify 依赖 |

---

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 生成完整实体映射表 | `HtmlEntities.ts` | 2231 个实体全覆盖 | 0.02 |
| 2 | 实现编码器 | `EntityEncoder.ts` | 三种模式均正确 | 0.02 |
| 3 | 实现解码器 | `EntityDecoder.ts` | 三种格式均正确 | 0.02 |
| 4 | 实现实体搜索 | `EntitySearch.ts` | 名称/字符/码点搜索 | 0.02 |
| 5 | 实现安全预览 | `SafePreview.ts` | XSS 向量无法执行 | 0.03 |
| 6 | 实现 UI 组件 | `EntityTool.vue` + 子组件 | 交互流畅 | 0.05 |
| 7 | 集成 DOMPurify | 依赖安装 + 配置 | 安全过滤正确 | 0.02 |
| 8 | 编写测试 | `tests/unit/html-entities/` | 编码/解码/安全覆盖 | 0.02 |

**总人天：0.2d**

---

## 六、测试规格

### 场景 1：基本 HTML 特殊字符编码

**GIVEN** 用户输入文本 `<script>alert("XSS")</script>`
**WHEN** 点击编码（命名实体模式）
**THEN** 输出 `&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;`
**AND** &、<、>、" 全部被正确编码

### 场景 2：十六进制数字实体编码

**GIVEN** 用户输入文本 `价格: ¥100 © 2024`
**WHEN** 选择十六进制编码模式并勾选"编码所有字符"
**THEN** `¥` 编码为 `&#xA5;`，`©` 编码为 `&#xA9;`
**AND** ASCII 字符保持不变

### 场景 3：混合实体解码

**GIVEN** 文本 `&lt;div&gt; &copy; 2024 &amp; &#x1F600;`
**WHEN** 点击解码
**THEN** 输出 `<div> © 2024 & 😀`
**AND** 命名实体 `&lt;`、`&copy;`、`&amp;` 正确解码
**AND** 十六进制实体 `&#x1F600;` 正确解码为 Emoji
**AND** 未转义的 `&`（没有分号）保持原样

### 场景 4：实体参考表搜索

**GIVEN** 打开实体参考表
**WHEN** 在搜索框输入 "arrow"
**THEN** 过滤显示含 "arrow" 的实体：`&larr;`、`&rarr;`、`&uarr;`、`&darr;`、`&harr;` 等
**AND** 每个实体显示：名称、字符、十进制码点、十六进制码点、描述

### 场景 5：安全 HTML 预览

**GIVEN** 解码后的 HTML `<p>Hello</p><script>alert('xss')</script><img src=x onerror=alert(1)>`
**WHEN** 点击"预览渲染"
**THEN** iframe 中显示 `<p>Hello</p>` 渲染后的文本
**AND** `<script>` 标签被移除（不执行）
**AND** `<img onerror>` 事件处理器被移除
**AND** 页面不弹出 alert（XSS 防护成功）

### 场景 6：BMP 外字符编解码

**GIVEN** 用户输入含 Emoji 的文本 `Hello 😀🎉 World`
**WHEN** 选择十进制编码所有字符
**THEN** `😀` 正确编码为 `&#128512;`
**AND** `🎉` 正确编码为 `&#127881;`
**AND** 解码后还原为原始 Emoji（不是乱码）

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| DOMPurify 配置不当导致 XSS 绕过 | 低 | 高 | 使用白名单标签和属性，禁止所有事件处理器，测试已知 XSS 向量 |
| 实体映射表过大影响加载速度 | 低 | 中 | 压缩后仅约 10KB，使用 Tree-shaking 仅打包用到的导出 |
| contenteditable 编辑体验差 | 中 | 中 | 提供纯文本模式切换（textarea），用于粘贴大量文本 |
| BMP 外字符编码错误 | 低 | 低 | 使用 `String.fromCodePoint` 而非 `String.fromCharCode`，正确处理 surrogate pairs |
| 正则回溯导致大文本解码慢 | 低 | 中 | 限制单次解码文本大小 100KB，超限分块或警告 |

---

## 八、回滚策略

| 场景 | 回滚操作 | 影响 |
|------|----------|------|
| 编码器输出错误 | 禁用编码功能，仅保留解码和参考表 | 编码功能不可用 |
| DOMPurify 加载失败 | 预览使用纯文本渲染（不解析 HTML 标签） | 失去 HTML 渲染预览 |
| 实体表过大 | 降级为仅包含常用 200 实体的精简表 | 罕见实体无法编解码 |
| 完全回滚 | 移除实体工具入口 | 功能回到改造前 |

---

## 九、设计决策记录

### D-01：为什么使用完整的 2231 个 HTML5 命名实体而非仅常用实体？

虽然 80% 的使用场景仅涉及约 50 个常用实体，但剩余的 20% 场景是用户最需要工具的场景（因为不常见的实体更记不住）。如果工具仅支持常用实体，用户在处理罕见实体时仍需切换到其他工具，失去一站式工具的便利性。40KB 的体积对现代浏览器扩展来说完全可接受。

### D-02：为什么编码选项区分命名实体/十进制/十六进制？

不同场景需要不同的实体格式。HTML 文档中首选命名实体（可读性好），XML 中需要十进制数字实体（XML 仅预定义了 5 个命名实体），CSS content 属性中常用十六进制（与其他 CSS 颜色值一致）。提供三种模式让用户可以针对具体场景选择最合适的格式。

### D-03：为什么使用 contenteditable div 而非 textarea？

textarea.value 会自动解码 HTML 实体（浏览器行为）。这意味着用户在解码后得到 `<script>`，复制粘贴到其他地方时 textarea 会保留，但如果用户直接粘贴到 textarea 中观察实体字符串 `&lt;script&gt;`，textarea 会自动将其显示为 `<script>`。contenteditable div 使用 innerText 可以保留实体字符串的字面形式。

### D-04：为什么安全预览使用 iframe sandbox + DOMPurify 双层防护？

iframe sandbox（不含 allow-scripts）阻止脚本执行，DOMPurify 清洗 HTML 移除危险标签和属性。双层防护的原因是：iframe sandbox 隔离了执行环境，DOMPurify 提供了更细粒度的 HTML 结构控制（移除恶意标签、保留安全标签）。两者互补，单靠任何一层都有风险。

---

## 十、可观测性

### 指标

| 指标 | 类型 | 说明 |
|------|------|------|
| `yipet.entity.use_count` | Counter | 实体工具使用次数 |
| `yipet.entity.encode_count` | Counter | 编码操作次数 |
| `yipet.entity.decode_count` | Counter | 解码操作次数 |
| `yipet.entity.encode_mode` | Counter | 各编码模式使用次数（named/decimal/hex） |
| `yipet.entity.search_count` | Counter | 实体搜索次数 |
| `yipet.entity.preview_count` | Counter | 安全预览次数 |
| `yipet.entity.copy_count` | Counter | 结果复制次数 |

### 告警

| 告警 | 条件 | 级别 |
|------|------|------|
| 编码失败率高 | 1h 内编码失败 > 5% | INFO |
| DOMPurify 加载失败 | 模块加载异常 | WARNING |

---

## 十一、代码审查检查清单

- [ ] 编码器支持三种模式（命名/十进制/十六进制）
- [ ] 解码器正确解析命名实体、十进制实体、十六进制实体
- [ ] 完整实体表包含 2231 个 HTML5 命名实体
- [ ] 反向映射（字符→实体名称）取最短名称
- [ ] contenteditable 编辑区不会自动解码实体引用
- [ ] 安全预览使用 iframe sandbox + DOMPurify
- [ ] BMP 外字符（如 Emoji）编解码正确
- [ ] 实体参考表支持搜索和过滤
- [ ] 实体参考表显示名称、字符、十进制码点、十六进制码点
- [ ] 编码所有字符模式正确处理非 ASCII 字符
- [ ] 解码时未识别实体保留原样（不丢失数据）

---

## 回归问题预测

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | 解码时 `&amp;lt;` 这样的双重编码实体，在单次解码后变成 `&lt;` 而不是 `<`，用户困惑为什么解码"不彻底" | 解码器一次只替换一层实体引用，双重编码需要两次解码 | 提供"递归解码"选项（循环解码直到不再变化），默认关闭 |
| 2 | 编码模式下，如果用户输入本身已包含实体引用（如 `&amp;`），编码后 `&` 被二次编码为 `&amp;amp;` | 编码器不区分用户输入的 `&` 是"要编码的普通字符"还是"已是实体引用的一部分" | 提供"智能编码"选项：先尝试解码再重新编码，或检测已有实体引用并跳过 |
| 3 | 十六进制数字实体中字母大小写不应影响解码（`&#x3c;` 和 `&#x3C;` 应该都解码为 `<`），但正则可能区分大小写 | `parseInt('3C', 16)` 正确但正则捕获组可能使用 `[a-fA-F]` 不完整 | 测试大写、小写、混合大小写的十六进制实体，验证全部正确解码 |
| 4 | 超大文本（如 500KB HTML 文件）编解码时，正则匹配可能因为回溯导致浏览器卡死甚至 "script timeout" | 大型 HTML 文件可能包含数千个实体引用，逐个正则替换的累积效应 | 限制输入文本 100KB，或分块处理（每 10KB 一块） |
| 5 | `contenteditable` div 中粘贴从网页复制的富文本时，可能会带进 HTML 格式（加粗、链接等），干扰编码输入 | 粘贴事件可能携带 `text/html` 格式数据，浏览器自动解析并应用到 contenteditable | 拦截 paste 事件，使用 `e.clipboardData.getData('text/plain')` 仅取纯文本 |
| 6 | 实体参考表中搜索中文描述时（如搜索"箭头"），因为实体映射表不含中文描述而返回空结果 | 当前实体映射表仅包含实体名称和字符本身，没有中文描述字段 | 为常用实体添加中文描述字段，或支持通过字符本身反向搜索（输入"→"找到 `&rarr;`） |

---

## 性能分析

### 各操作耗时

| 操作 | 预估耗时 | 说明 |
|------|----------|------|
| 编码（1KB 文本） | < 5ms | Map 查找 + 逐字符遍历 |
| 编码（100KB 文本） | < 100ms | 全量编码模式耗时长 |
| 解码（1KB 文本，20+ 实体） | < 5ms | 正则 replace 单次遍历 |
| 解码（100KB 文本，2000+ 实体） | < 100ms | 正则匹配次数增加 |
| 实体表搜索过滤（2231 条） | < 10ms | Array.filter 线性扫描 |
| 安全预览（1KB HTML） | < 50ms | DOMPurify 清洗 + iframe 创建 |
| 复制到剪贴板 | < 10ms | navigator.clipboard.writeText |

### 文件体积预估

| 文件 | 大小 | 说明 |
|------|------|------|
| `HtmlEntities.ts` | ~25KB | 完整实体映射表（压缩后 ~8KB） |
| `EntityEncoder.ts` | ~2KB | 编码器 |
| `EntityDecoder.ts` | ~2KB | 解码器 |
| `EntitySearch.ts` | ~1KB | 搜索工具 |
| `SafePreview.ts` | ~2KB | 安全预览 |
| `EntityTool.vue` | ~4KB | 主界面 |
| `EntityEncodePanel.vue` | ~3KB | 编码面板 |
| `EntityDecodePanel.vue` | ~2KB | 解码面板 |
| `EntityReferenceTable.vue` | ~3KB | 参考表 |
| `dompurify` 依赖 | ~15KB | npm 包（压缩后） |

---

## 相关文档

- [HTML Living Standard - Named Character References](https://html.spec.whatwg.org/multipage/named-characters.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [MDN - HTML Entities](https://developer.mozilla.org/en-US/docs/Glossary/Entity)