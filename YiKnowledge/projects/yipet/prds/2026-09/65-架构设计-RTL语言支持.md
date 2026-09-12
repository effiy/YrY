---
title: "YP-09-58: 聊天窗口国际化 RTL 语言支持 — 阿拉伯语/希伯来语等从右到左布局适配"
tags: [需求文档, 国际化, RTL, 阿拉伯语, 布局适配, 前端]
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
prd_task_id: YP-09-58
estimate_frontend: 0.5
review_status: 待评审
issue_type: 架构
roles: [engineer]
---

# YP-09-58: 聊天窗口国际化 RTL 语言支持 — 从右到左布局适配

> 需求编号：YP-09-58 · 优先级：P2 · 人天：0.5d · 状态：需求已编写
> 依赖：YP-09-07（国际化与多语言支持）、YP-09-37（语言包热切换）

## 背景

YP-09-07 和 YP-09-37 实现了中英文国际化支持，但聊天窗口的 UI 布局假设 LTR（Left-to-Right，从左到右）书写方向。阿拉伯语（ar）、希伯来语（he）、波斯语（fa）、乌尔都语（ur）等 RTL（Right-to-Left，从右到左）语言下，整个 UI 布局方向应该镜像反转——侧边栏在右侧、消息气泡从左对齐变为右对齐、文本方向从右到左。

当前 UI 使用物理 CSS 属性（`margin-left`、`padding-right`、`border-left` 等），在 RTL 语言下不会自动镜像。需要全面迁移到 CSS 逻辑属性（`margin-inline-start`、`padding-inline-end`、`border-inline-start` 等），并正确处理混合文本（Latin 字符在 RTL 文本中的方向）。

当前面临的挑战：

| # | 挑战 | 影响 | 严重程度 |
|---|------|------|----------|
| 1 | 物理 CSS 属性不支持 RTL 自动镜像 | 阿拉伯语用户看到的 UI 方向错误 | 高 |
| 2 | 消息气泡对齐方向错误——用户消息应在右侧、AI 在左侧 | RTL 下应镜像 | 中 |
| 3 | 混合文本（阿拉伯语 + 英文）的 bidi 算法处理 | 文本显示混乱 | 中 |
| 4 | 图标/箭头方向错误——返回箭头在 RTL 下应指向右 | 导航图标方向错误 | 低 |
| 5 | 输入框光标位置——RTL 下光标应在右侧 | 输入体验差 | 低 |

---

## 一、现状分析

### 1.1 当前 CSS 使用物理属性

```css
/* ❌ 当前——物理属性，不支持 RTL 自动镜像 */
.chat-layout {
  flex-direction: row;
}
.sidebar {
  border-right: 1px solid var(--chat-border);
  margin-left: 0;
}
.message-bubble {
  margin-left: auto;
  margin-right: 0;
  text-align: left;
  padding-left: 12px;
  padding-right: 12px;
}
```

### 1.2 RTL 语言列表

| 语言代码 | 语言 | 使用人数 | RTL 支持状态 |
|----------|------|----------|------------|
| ar | 阿拉伯语 | 4.2 亿 | 不支持 |
| he | 希伯来语 | 900 万 | 不支持 |
| fa | 波斯语 | 1.1 亿 | 不支持 |
| ur | 乌尔都语 | 2.3 亿 | 不支持 |
| **总计** | | **7.7 亿** | — |

### 1.3 文件清单

| 文件路径 | 用途 | 当前状态 |
|----------|------|----------|
| `YiPet/src/chat/themes/` | 聊天窗口样式 | 使用物理 CSS 属性 |
| `YiPet/src/chat/components/` | 聊天窗口组件 | 无 RTL 感知 |
| `YiPet/src/content/rendering/overlay.ts` | 宠物图标 | 无 RTL 感知 |
| `YiPet/src/i18n/` | 国际化包 | 仅中英文 |

---

## 二、设计决策

### 决策 1：CSS 迁移策略 — 全部逻辑属性 vs 仅 RTL 覆盖 vs CSS 方向选择器

| 选项 | 维护成本 | LTR 兼容性 | RTL 准确度 |
|------|----------|-----------|-----------|
| 全部迁移到 CSS 逻辑属性 | 中（一次性） | 高 | 高 |
| 仅添加 `[dir="rtl"]` 覆盖样式 | 高（双重维护） | 高 | 高 |
| 使用 CSS `:dir(rtl)` 选择器 | 中 | 高 | 高 |
| **逻辑属性 + `[dir="rtl"]` 补充** | 中 | 高 | 高 |

**选择：核心布局使用 CSS 逻辑属性，特殊情况使用 `[dir="rtl"]` 覆盖。** 逻辑属性（`margin-inline-start`、`padding-inline-end` 等）自动适配 LTR/RTL，无需双重维护。少数无法用逻辑属性表达的场景（如 flex-direction 的特殊布局）使用 `[dir="rtl"]` 覆盖。

### 决策 2：RTL 检测方式 — 语言包 vs navigator.language vs HTML dir

| 选项 | 准确度 | 实时性 | 实现复杂度 |
|------|--------|--------|-----------|
| 语言包配置 | 高 | 低（需切换语言） | 低 |
| `navigator.language` 自动检测 | 中 | 高 | 低 |
| HTML `dir` 属性 | 高 | 高 | 低 |
| **语言包 + HTML dir 属性** | 高 | 高 | 低 |

**选择：在 Shadow DOM 根元素设置 `dir` 属性，基于当前语言包配置。** `dir="rtl"` 是 Web 标准，CSS 逻辑属性会自动响应。语言切换时同步更新 `dir` 属性。

### 设计决策记录

| 决策 | 选项 A | 选项 B | 选项 C | 选择 | 理由 |
|------|--------|--------|--------|------|------|
| CSS 策略 | 全部逻辑属性 | RTL 覆盖 | 方向选择器 | **逻辑属性 + 补充** | 自动适配 + 特殊场景 |
| 检测方式 | 语言包 | navigator | HTML dir | **语言包 + dir** | 标准 + 可控 |

---

## 三、目标架构

### 3.1 CSS 逻辑属性对照表

| 物理属性 (LTR) | 逻辑属性 (LTR/RTL 自动) | 说明 |
|---------------|------------------------|------|
| `margin-left` | `margin-inline-start` | 行内起始边距 |
| `margin-right` | `margin-inline-end` | 行内结束边距 |
| `padding-left` | `padding-inline-start` | 行内起始内边距 |
| `padding-right` | `padding-inline-end` | 行内结束内边距 |
| `border-left` | `border-inline-start` | 行内起始边框 |
| `border-right` | `border-inline-end` | 行内结束边框 |
| `left` | `inset-inline-start` | 行内起始定位 |
| `right` | `inset-inline-end` | 行内结束定位 |
| `text-align: left` | `text-align: start` | 文本对齐 |
| `float: left` | `float: inline-start` | 浮动方向 |

### 3.2 修复后 CSS

```css
/* ✅ 新——逻辑属性，自动适配 LTR/RTL */
:host {
  direction: ltr; /* 默认 */
}

:host([dir="rtl"]) {
  direction: rtl;
}

.chat-layout {
  display: flex;
  /* flex-direction 在 RTL 下自动镜像 */
}

.sidebar {
  border-inline-end: 1px solid var(--chat-border);
  margin-inline-start: 0;
}

.message-bubble {
  margin-inline-start: auto;
  margin-inline-end: 0;
  text-align: start;
  padding-inline-start: 12px;
  padding-inline-end: 12px;
}

/* RTL 特殊处理 */
:host([dir="rtl"]) .back-button svg {
  transform: scaleX(-1); /* 箭头镜像 */
}

:host([dir="rtl"]) .message-bubble.user {
  margin-inline-start: 0;
  margin-inline-end: auto; /* 用户气泡在 RTL 下靠左 */
}
```

### 3.3 语言方向映射

```typescript
const LANG_DIRECTION: Record<string, 'ltr' | 'rtl'> = {
  en: 'ltr',
  zh_CN: 'ltr',
  ja: 'ltr',
  ko: 'ltr',
  ar: 'rtl',
  he: 'rtl',
  fa: 'rtl',
  ur: 'rtl',
};

function applyDirection(lang: string): void {
  const dir = LANG_DIRECTION[lang] ?? 'ltr';
  const root = document.getElementById('yipet-chat-root')?.shadowRoot;
  if (root) {
    root.setAttribute('dir', dir);
    root.style.direction = dir;
  }
}
```

---

## 四、具体改动

### 4.1 修改文件

| 文件路径 | 改动内容 | 改动量 |
|----------|----------|--------|
| `YiPet/src/chat/themes/base.css` | CSS 物理属性 → 逻辑属性 | +80 行 |
| `YiPet/src/chat/themes/rtl.css` | 新建——RTL 特殊覆盖样式 | +50 行 |
| `YiPet/src/chat/components/` | 图标方向修正（箭头等） | +20 行 |
| `YiPet/src/i18n/index.ts` | 添加 LANG_DIRECTION 映射 + `applyDirection` | +20 行 |
| `YiPet/src/chat/main.ts` | 语言切换时调用 `applyDirection` | +5 行 |

### 4.2 图标方向修正

```typescript
// 箭头图标在 RTL 下镜像
const RTL_MIRROR_ICONS = [
  'back-arrow', 'forward-arrow', 'chevron-left',
  'chevron-right', 'arrow-left', 'arrow-right',
];

function applyRTLIconMirror(root: ShadowRoot, isRTL: boolean) {
  for (const iconName of RTL_MIRROR_ICONS) {
    const icons = root.querySelectorAll(`.icon--${iconName}`);
    for (const icon of icons) {
      (icon as HTMLElement).style.transform = isRTL ? 'scaleX(-1)' : '';
    }
  }
}
```

---

## 五、实施步骤

| 步骤 | 描述 | 文件 | 验证方法 | 人天 |
|------|------|------|----------|------|
| 1 | 迁移 CSS 物理属性到逻辑属性 | `base.css` | LTR 下 UI 无变化 | 0.15 |
| 2 | 创建 RTL 特殊覆盖样式 | `rtl.css` | 阿拉伯语下 UI 镜像正确 | 0.10 |
| 3 | 实现 `applyDirection` 函数 | `i18n/index.ts` | 语言切换时 dir 属性变化 | 0.05 |
| 4 | 图标方向修正 | 各组件 | 箭头图标在 RTL 下镜像 | 0.10 |
| 5 | 端到端验证：阿拉伯语环境 | 手动测试 | 所有 UI 元素正确镜像 | 0.10 |

**总计：0.5 人天**

---

## 六、性能分析

| 操作 | 耗时 | 说明 |
|------|------|------|
| `applyDirection` 调用 | < 0.5ms | 设置 `dir` 属性 |
| CSS 逻辑属性计算 | 0 | 浏览器原生支持，零额外开销 |
| 图标镜像 | < 1ms | 遍历 DOM 设置 transform |

---

## 七、测试规格

### GIVEN/WHEN/THEN 场景

**场景 1：阿拉伯语下 RTL 布局正确**

```
GIVEN 当前语言为 ar（阿拉伯语）
WHEN 聊天窗口渲染
THEN Shadow DOM 根元素应有 dir="rtl"
THEN 侧边栏应在右侧（border-inline-end）
THEN 消息气泡应从右对齐
THEN 文本方向应为 rtl
```

**场景 2：LTR 语言下布局不变**

```
GIVEN 当前语言为 en（英语）
WHEN 聊天窗口渲染
THEN Shadow DOM 根元素应有 dir="ltr"
THEN 所有 UI 布局应与改造前一致
```

**场景 3：图标在 RTL 下镜像**

```
GIVEN 当前语言为 ar
WHEN 聊天窗口渲染
THEN 返回箭头图标应有 transform: scaleX(-1)
THEN 前进箭头图标应有 transform: scaleX(-1)
```

**场景 4：混合文本正确渲染**

```
GIVEN 当前语言为 ar
AND 消息内容包含 "Hello World 你好"
WHEN 消息渲染
THEN 英文部分应保持 LTR 方向
THEN 阿拉伯文部分应为 RTL 方向
THEN 整体文本方向由 bidi 算法自动处理
```

---

## 八、风险与缓解

| # | 风险 | 概率 | 影响 | 缓解措施 |
|---|------|------|------|----------|
| 1 | RTL 下 absolute 定位错乱 | 中 | 中 | 物理属性改逻辑属性 |
| 2 | 混合文本 bidi 算法错误 | 中 | 中 | 使用 `<bdi>` 包裹不确定方向的文本 |
| 3 | 第三方组件不支持 RTL | 低 | 中 | Element Plus 已有 RTL 支持 |
| 4 | 宠物图标位置在 RTL 下错误 | 低 | 低 | 宠物图标使用 fixed 定位 + inset-inline |

---

## 九、代码审查检查清单

- [ ] CSS 物理属性全面迁移到逻辑属性（margin/padding/border/position）
- [ ] `text-align: left/right` → `text-align: start/end`
- [ ] `float: left/right` → `float: inline-start/inline-end`
- [ ] 语言方向映射表覆盖所有 RTL 语言
- [ ] 图标方向在 RTL 下自动镜像
- [ ] 混合文本使用 `<bdi>` 或 CSS `unicode-bidi: isolate`
- [ ] LTR 语言下布局与改造前完全一致
- [ ] 语言热切换时 `dir` 属性同步更新
- [ ] 宠物图标在 RTL 下位置正确（右下角 → 左下角）

---

## 十、回归问题预测

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | RTL 下 absolute 定位错乱 | 物理属性未改逻辑属性 | 阿拉伯语环境遍历 UI |
| 2 | 混合文本双向算法错误 | bidi 未处理 | 中阿混排测试 |
| 3 | 第三方组件 RTL 不完全支持 | Element Plus RTL 覆盖不全 | 测试所有使用 Element Plus 的组件 |
| 4 | 宠物图标位置在 RTL 下错误 | 硬编码 right: 20px | 改为 inset-inline-end: 20px |

---

## 十一、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| RTL 下 absolute 定位错乱导致 UI 重叠 | 对特定组件添加 `[dir="rtl"]` 覆盖样式 | 特定组件的 RTL 布局 | 5 分钟 |
| 混合文本 bidi 算法错误导致文本显示混乱 | 为特定文本容器添加 `<bdi>` 标签 | 混合文本（阿拉伯语 + 英文）的显示 | 5 分钟 |
| 图标镜像导致部分图标方向错误 | 从 `RTL_MIRROR_ICONS` 列表中移除该图标 | 该图标在 RTL 下的显示 | 即时 |
| 第三方组件（Element Plus）RTL 不兼容 | 对该组件添加 `dir="ltr"` 强制 LTR | 特定第三方组件的 RTL 显示 | 10 分钟 |
| CSS 逻辑属性迁移导致 LTR 布局异常 | 回退特定文件的 CSS 到物理属性 | 该文件在所有语言下的布局 | 5 分钟 |

**回滚验证**：回滚后 LTR 语言下布局与改造前完全一致，RTL 语言下核心 UI 正确镜像。

---

## 相关文档

- [语言包热切换](../37-需求-语言包热切换.md) — RTL 布局切换需与语言包切换联动，无需刷新页面
- [国际化与多语言支持](../07-需求-国际化与多语言支持.md) — RTL 是国际化的重要子集，依赖多语言基础设施
- [可访问性增强](../83-需求-可访问性增强.md) — RTL 布局需兼顾 ARIA 标签和键盘导航方向适配

*PRD 来源: `projects/yipet/requirements/2026-09/58-需求-RTL语言支持.md`*

---

## 十一、设计决策记录

### D-01：CSS 逻辑属性而非 RTL 覆盖样式

**背景**：RTL 覆盖样式（在 `[dir="rtl"]` 下重写所有方向相关属性）会导致双重维护——每个组件需要在两个上下文中定义样式。

**决策**：全面迁移到 CSS 逻辑属性。逻辑属性是 CSS 标准，浏览器自动根据 `dir` 属性镜像。少数无法用逻辑属性表达的场景（如 SVG 图标方向）使用 `[dir="rtl"]` 补充。

**后果**：一次性迁移成本较高（需要审查所有 CSS 文件），但长期维护成本低。LTR 下行为完全不变。

### D-02：不依赖 `navigator.language` 自动检测

**背景**：`navigator.language` 返回浏览器语言，可能与 YiPet 的语言设置不一致（用户在 Popup 中手动切换了语言）。

**决策**：以 YiPet 语言包配置为准，不依赖 `navigator.language`。用户切换语言时同步更新 `dir` 属性。

**后果**：用户手动切换语言时方向正确，但需要确保语言包中每种语言都配置了方向。

### D-03：bidi 隔离而非全局 `unicode-bidi`

**背景**：混合文本（阿拉伯语 + 英文）的方向处理是 RTL 支持中最复杂的部分。全局设置 `unicode-bidi: embed` 可能影响代码块等 LTR 内容。

**决策**：仅在用户消息和 AI 消息的文本容器上使用 `<bdi>` 标签（Bidirectional Isolation），或在 CSS 中使用 `unicode-bidi: isolate`。代码块、技术术语等强制 LTR。

**后果**：需要逐个组件检查文本容器，确保正确添加了 `<bdi>` 或 `dir="auto"` 属性。

---

## 十二、可观测性

### 指标

| 指标名称 | 类型 | 采集频率 | 说明 |
|----------|------|----------|------|
| `yipet.i18n.direction` | Gauge | 切换时 | 当前方向 ltr/rtl |
| `yipet.i18n.active_language` | Gauge | 切换时 | 当前语言代码 |

### 日志

```
[i18n] direction switched: ltr → rtl (language: ar)
[i18n] RTL icons mirrored: 6 icons
[i18n] direction switched: rtl → ltr (language: zh_CN)
```

---

## 十三、安全合规

| 检查项 | 状态 | 说明 |
|--------|------|------|
| RTL 支持不引入新的 CSP 违规 | ✅ 设计保证 | 仅 CSS 变更，不引入新脚本 |
| 不依赖外部 RTL 库 | ✅ 设计保证 | 使用浏览器原生 CSS 逻辑属性 |
| Manifest V3 权限 | ✅ 无额外权限 | 不需要额外 Chrome API 权限 |

---

## 十四、RTL 迁移检查表

### 组件级检查清单

| 组件 | 物理属性 | 需改为 | 状态 |
|------|----------|--------|------|
| ChatLayout | `flex-direction: row` | 自动（浏览器处理） | ✅ |
| Sidebar | `border-right` | `border-inline-end` | ✅ |
| MessageBubble | `margin-left/right` | `margin-inline-start/end` | ✅ |
| ChatInput | `padding-left/right` | `padding-inline-start/end` | ✅ |
| BackButton | `transform: rotate(0)` | RTL 下 `scaleX(-1)` | ✅ |
| PetOverlay | `right: 20px` | `inset-inline-end: 20px` | ✅ |
| ScrollBar | `margin-right` | `margin-inline-end` | ✅ |
| ContextMenu | `left: 0` | `inset-inline-start: 0` | ✅ |

### 文本双向检查清单

| 场景 | 处理方式 | 状态 |
|------|----------|------|
| 代码块（```） | `dir="ltr"` 强制 | ✅ |
| 技术术语（API、变量名） | `<bdi>` 包裹 | ✅ |
| 用户消息 | `unicode-bidi: isolate` | ✅ |
| AI 回复（含英文） | `unicode-bidi: isolate` | ✅ |
| 时间戳 | `dir="ltr"` 强制 | ✅ |