# 场景-4-存量页面迁移

> **所属故事**: yry-cdn
> **场景**: 存量故事面板页面迁移到 CDN
> **覆盖 Story#**: Story 5

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TD
    BEFORE["迁移前<br/>页内 &lt;style&gt; 含所有 CSS<br/>+ 内联工具函数"]:::before --> STEP1["① 分析<br/>识别可删除的重复样式"]:::step
    STEP1 --> STEP2["② 判定<br/>页面类型 Cat A / Cat B"]:::step
    STEP2 --> STEP3["③ 添加 CDN 引用<br/>&lt;link&gt; + &lt;script&gt;"]:::step
    STEP3 --> STEP4["④ 替换类名<br/>旧类名 → yry-* 前缀"]:::step
    STEP4 --> STEP5["⑤ 替换 JS 调用<br/>旧函数 → YrY.*"]:::step
    STEP5 --> STEP6["⑥ 验证<br/>截图对比 + 交互测试"]:::step
    STEP6 --> AFTER["迁移后<br/>页内仅保留专属样式<br/>通用样式由 CDN 提供"]:::after

    classDef before fill:#2a1a1a,stroke:#ef4444,color:#ef4444
    classDef step fill:#1a2a3a,stroke:#3d59a1,color:#a9b1d6
    classDef after fill:#1a3a1a,stroke:#22c55e,color:#22c55e
```

## 效果示意

> 页面迁移完成后，页内代码量减少 40%–60%，视觉和交互行为无变化。后续 CDN 组件升级，该页面自动受益。

| 维度 | 迁移前 | 迁移后 |
|------|--------|--------|
| 页内 `<style>` | 含 Reset、动画、面包屑、导航、Toolbar、Toast 等（~100 行） | 仅保留页面专属样式（scene cards、file cards、SVG 等 ~40 行） |
| 页内 `<script>` | 含 toast()、copyCmd()、switchPanel() 等内联定义（~60 行） | 仅保留页面专属逻辑（~10 行） |
| CDN 引用 | 0 | 3–4 个 `<link>` + `<script>` |
| 视觉一致性 | 各页面自行维护，可能漂移 | 统一由 CDN 管控 |

## 主要价值

| # | 价值 | 说明 |
|---|------|------|
| 📉 | **代码量减少** | 每页面减少 100–150 行内联代码 |
| 🔄 | **自动升级** | CDN 组件升级后所有页面自动受益，无需逐页面修改 |
| 🎯 | **一致性保证** | 所有页面使用同一套组件，视觉/交互无漂移 |
| ⚡ | **缓存收益递增** | 每多迁移一个页面，浏览器缓存的 CDN 资源被多利用一次 |

---

## §0 技术评审

### §0.1 迁移判定流程

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TD
    START["选择目标页面"]:::entry --> Q1{"页面引用 CDN 了吗?"}
    Q1 -->|"已引用"| SKIP["跳过 — 已迁移"]:::skip
    Q1 -->|"未引用"| Q2{"页面类型?"}

    Q2 -->|"架构图 / 知识图谱"| CAT_A["Category A"]:::mono
    Q2 -->|"审查 / 测试 / 演示 / 计划 / plan / index"| CAT_B["Category B"]:::sys

    CAT_A --> AUDIT_A["审查页内 &lt;style&gt;<br/>对比 shared.css + theme-mono.css<br/>标记可删除块"]
    CAT_B --> AUDIT_B["审查页内 &lt;style&gt;<br/>对比 shared.css + theme.css<br/>标记可删除块"]

    AUDIT_A --> CONF_A{确认 Category A<br/>迁移清单}
    AUDIT_B --> CONF_B{确认 Category B<br/>迁移清单}

    CONF_A --> EXEC["执行 6 步迁移"]
    CONF_B --> EXEC

    EXEC --> VERIFY["截图对比<br/>迁移前 vs 迁移后"]
    VERIFY --> PASS{"视觉一致?"}
    PASS -->|"是"| DONE["✅ 迁移完成"]:::done
    PASS -->|"否"| ROLLBACK["回滚 + 标记<br/>保留专属样式"]:::fail

    classDef entry fill:#1a2a3a,stroke:#3d59a1,color:#a9b1d6
    classDef skip fill:#1a3a2a,stroke:#22c55e,color:#a9b1d6
    classDef mono fill:#1a2a4a,stroke:#22d3ee,color:#22d3ee
    classDef sys fill:#2a1a3a,stroke:#FFC107,color:#FFC107
    classDef done fill:#1a3a1a,stroke:#22c55e,color:#34d399
    classDef fail fill:#2a1a1a,stroke:#ef4444,color:#ef4444
```

### §0.2 可删除的样式清单

#### Category A 页面可删除（对比 shared.css + theme-mono.css）

| 可删除块 | 对应 CDN 文件 | 保留条件 |
|---------|--------------|---------|
| `*, *::before, *::after { ... }` | shared.css | 无 — CDN 已覆盖 |
| `@keyframes yry-*` | shared.css | 若使用 CDN 动画（当前无 Cat A 使用 shared.css 动画） |
| `.yry-breadcrumb` / `.yry-cross-nav` / `.yry-toolbar` | shared.css | 无 — CDN 已覆盖 |
| `.yry-toast` 样式 | shared.css | 无 — CDN 已覆盖 |
| `body { font-family: 'JetBrains Mono'... }` | theme-mono.css | 无 — CDN 已覆盖 |
| `.yry-mono-container` / `.yry-mono-header` | theme-mono.css | 无 — CDN 已覆盖 |
| `.yry-diagram-wrap` / `.yry-graph-wrap` | theme-mono.css | 无 — CDN 已覆盖 |
| `.yry-pulse-dot` / `.yry-mono-legend` | theme-mono.css | 无 — CDN 已覆盖 |
| `.yry-mono-cards` / `.yry-mono-card` / `.yry-mono-dot` | theme-mono.css | 无 — CDN 已覆盖 |

#### Category B 页面可删除（对比 shared.css + theme.css）

| 可删除块 | 对应 CDN 文件 |
|---------|--------------|
| `*, *::before, *::after { ... }` | shared.css |
| `@keyframes yry-fadeInUp/Down/slideDown/pulse` | shared.css |
| `.yry-breadcrumb` / `.yry-cross-nav` / `.yry-toolbar` / `.yry-toast` | shared.css |
| `:root { --yry-* }` CSS 变量定义 | theme.css |
| `body { background/font-family/color }` | theme.css |
| `.yry-container` / `.yry-container-sm` | theme.css |
| `.yry-header h1 / .yry-sub` | theme.css |
| `.yry-stats` / `.yry-stat` / `.yry-stat-val` / `.yry-stat-lbl` | theme.css |
| `.yry-bar-wrap` / `.yry-bar-outer` / `.yry-seg` | theme.css |
| `.yry-tabs` / `.yry-tab` / `.yry-tab-badge` | theme.css |
| `.yry-panel` / `.yry-panel.on` | theme.css |
| `.yry-card` | theme.css |
| `.yry-suite` / `.yry-suite-head` / `.yry-suite-arrow` / `.yry-suite-badge` / `.yry-suite-body` | theme.css |
| `.yry-progress-wrap` / `.yry-progress-label` / `.yry-progress-bar` / `.yry-progress-fill` | theme.css |
| `.yry-btn` / `.yry-btn.on` | theme.css |
| `.yry-section` / `.yry-dot` | theme.css |
| `.yry-link-grid` / `.yry-link-card` | theme.css |
| `.yry-footer` | shared.css |

### §0.3 不可删除的样式（保留在页内）

| 保留块 | 原因 |
|--------|------|
| `.scene-card` / `.file-card` 等页面专属 CSS | CDN 不覆盖业务组件 |
| SVG 相关样式（`svg { ... }` `.node { ... }` `.edge { ... }`） | 每页 SVG 不同 |
| `.mermaid` 相关样式 | mermaid 渲染由 mermaid.js 控制 |
| `.yry-` 选择器的页面级覆盖 | 覆盖为特例，保留在页内 |
| `@media print` 页面专属 | CDN 仅覆盖通用打印样式 |

### §0.4 可替换的 JS 函数

| 页内函数 | CDN 替换 | 注意 |
|---------|---------|------|
| `function toast(msg, dur) { ... }` | `YrY.toast(msg, dur)` | 参数顺序相同 |
| `function copyCmd(btn, cmd) { ... }` | `YrY.copyCmd(btn, cmd)` | 签名相同 |
| `function switchPanel(name) { ... }` | `YrY.switchPanel(name)` | 检查面板 ID 命名是否匹配约定 |
| `document.querySelectorAll('.yry-suite-head').forEach(...)` | `YrY.initSuiteToggle()` | 一次性替换 |
| 内联 `navigator.clipboard.writeText()` | `YrY.clipboardWrite(text, ok, fail)` | 需提供回调 |

### §0.5 迁移范例

参考已迁移页面：`docs/故事任务面板/rui-npm/plan.html`

> 证据: `cdn/README.md:115`

### §0.6 安全考量

| # | 信号 | 风险 | 缓解 |
|---|------|------|------|
| S1 | 迁移时误删安全相关 CSS（如 CSP 相关） | 安全策略失效 | 迁移清单明确"保留页内专属样式"；diff 审查 CSS 删除块 |
| S2 | 替换 JS 调用后事件绑定丢失 | 交互功能失效 | 迁移后逐项测试 Toast/复制/面板切换/折叠 |

---

### 基线溯源

| 来源 | 行号 | 内容 |
|------|------|------|
| `cdn/README.md` | 107–115 | 迁移指南 6 步 |
| `cdn/README.md` | 46–65 | 组件速查表（判别可迁移样式） |
| `cdn/shared.css` | 1–94 | 全局样式覆盖清单 |
| `cdn/theme.css` | 1–224 | System 组件覆盖清单 |
| `cdn/theme-mono.css` | 1–108 | Mono 组件覆盖清单 |

---

## §1 测试设计

### §1.1 测试策略

| 层级 | 类型 | 工具 | 范围 |
|------|------|------|------|
| L1 截图对比 | 视觉回归 | 浏览器截图 | 迁移前后像素级对比 |
| L2 样式验证 | 计算样式 | DevTools Computed | 关键元素的计算样式一致 |
| L3 交互验证 | 功能测试 | 手动 | Toast / 复制 / 面板切换 / 折叠 |
| L4 代码审查 | diff 审查 | git diff | 确认仅删除 CDN 覆盖的代码 |

### §1.2 测试用例

#### TC1 — 迁移前基线截图

| 维度 | 内容 |
|------|------|
| 测试目标 | 记录迁移前的页面渲染状态 |
| 前置条件 | 目标页面在迁移分支前 |
| 步骤 | 1. 打开目标页面<br>2. 全页截图（含 scroll）<br>3. 记录 DevTools Computed 面板：body background / font-family / --yry-* 变量 |
| 期望 | 基线数据保存 |
| Gate A 交接 | 基线截图和计算样式已保存 |

#### TC2 — 迁移后视觉对比

| 维度 | 内容 |
|------|------|
| 测试目标 | 迁移后页面视觉与迁移前一致 |
| 前置条件 | 完成迁移 6 步 |
| 步骤 | 1. 打开迁移后页面<br>2. 全页截图<br>3. 与基线截图对比（可用 DevTools 叠图） |
| 期望 | 无视觉差异（像素级一致） |
| Gate A 交接 | 截图对比 0 差异 |

#### TC3 — 迁移后交互功能

| 维度 | 内容 |
|------|------|
| 测试目标 | 迁移后 JS 交互功能正常 |
| 前置条件 | 迁移完成 |
| 步骤 | 1. console: `YrY.toast('迁移测试')` — 检查 Toast<br>2. 点击复制按钮 — 检查反馈<br>3. 点击标签页 — 检查切换<br>4. 点击折叠套件头部 — 检查展开/收起 |
| 期望 | 全部交互功能与迁移前一致 |
| Gate A 交接 | 4 项交互全部通过 |

#### TC4 — 代码审查

| 维度 | 内容 |
|------|------|
| 测试目标 | 确认仅删除 CDN 覆盖的代码，保留页面专属代码 |
| 前置条件 | git diff 迁移分支 vs main |
| 步骤 | 1. git diff 检查删除行<br>2. 逐行确认删除项在 CDN 覆盖清单中<br>3. 检查是否有 CDN 未覆盖的代码被删除 |
| 期望 | 删除的代码 100% 在 CDN 覆盖清单中；页面专属样式/逻辑保留 |
| Gate A 交接 | git diff 审查通过 |

---

### §1.3 Gate A 交接信号

| # | 信号 | 验证命令 | 期望值 |
|---|------|---------|--------|
| G1 | CDN 引用存在 | `document.querySelectorAll('link[href*="cdn/shared.css"]').length` | ≥ 1 |
| G2 | shared.js 已加载 | `typeof YrY` | `"object"` |
| G3 | 页内代码减少 | git diff stat | 净删除行 > 0 |
| G4 | 视觉一致 | 截图对比 | 0 差异 |

---

> **约束**: 只读源码 · 场景 §2–§4 由 code 阶段填充
> **末端触发**: rui-import + rui-bot 手动触发

## 回溯链

| 角色 | 来源 | 证据 |
|------|------|------|
| 文档 | `cdn/README.md:107–115` | 迁移指南 6 步 |
| 文档 | `cdn/README.md:115` | 迁移范例引用 |
| 源码 | `cdn/shared.css` | 全局样式覆盖清单 |
| 源码 | `cdn/theme.css` | System 组件覆盖清单 |

### 变更记录

| 日期 | 版本 | 变更 | 触发 |
|------|------|------|------|
| 2026-06-07 | 1.0.0 | 初始生成 | `/rui doc --from-code cdn` |
