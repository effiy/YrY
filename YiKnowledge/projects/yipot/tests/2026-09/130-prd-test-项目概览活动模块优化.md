---
doc_type: test
title: "项目概览活动模块优化 — 测试方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["101-prd-项目概览活动模块优化"]
source_modules: ["123-prd-task-项目概览活动模块优化"]
tags: [测试方案, 项目概览, 活动时间线, 内容预览]
category: 项目/管理后台/测试
source: 内部
type: test
---

# 项目概览活动模块优化 — 测试方案

> 测试编号：YP-09-101 · 优先级：P2

---

## 测试目标

验证 "Recent Activity" 模块的 7 项优化：标题自适应、连接线修复、筛选平滑切换、Issues/Bugs/Docs 内容预览、预览文本质量。

---

## 测试环境

| 条件 | 值 |
|------|-----|
| 后端 | YiAi `:10086` 运行中 |
| 前端 | YiVad `:8848` 开发模式 |
| 测试页面 | `http://localhost:8848/#/project/yipot` |
| 浏览器 | Chrome/Firefox/Safari 最新版 |
| 数据条件 | YiPot 项目存在 Issues、Bugs、Modules、Knowledge Files |

---

## 测试用例

### TC-1: 标题自适应宽度

| 维度 | 内容 |
|------|------|
| **前置条件** | 存在标题长度 > 30 字符的 Issue 或 Bug |
| **操作** | 在 1920px / 1440px / 1024px 三种窗口宽度下观察活动列表 |
| **预期** | 标题填充 badge/action 右侧全部可用空间，超出部分 `...` 截断 |
| **验证方法** | DevTools 检查 `.do-timeline-target` 的 computed width，确认 > 200px（宽屏） |
| **回归风险** | 窄屏（< 768px）下标题不应挤压 badge/action 至不可见 |

### TC-2: 连接线尾部无溢出

| 维度 | 内容 |
|------|------|
| **前置条件** | 活动列表 ≥ 2 组（Today + Yesterday 或更早） |
| **操作** | 观察每组最后一项活动的下方 |
| **预期** | 每组最后一项下方无连接线残留 |
| **验证方法** | DevTools 检查 `.do-timeline-item--last .do-timeline-line` 的 computed display 为 `none` |
| **边界** | 仅 1 组（全部 Today）时，最后一项也不应有连接线 |

### TC-3: 筛选切换无闪烁

| 维度 | 内容 |
|------|------|
| **前置条件** | 活动列表包含多种类型数据 |
| **操作** | 依次点击 All → Requirements → Bugs → Modules → Docs → All |
| **预期** | 列表项平滑增删，不出现全量重建的从左侧滑入动画 |
| **验证方法** | Performance 面板录制筛选操作，确认 DOM 操作数 < 30（非全量重建） |
| **边界** | 筛选后为空时，显示 `el-empty` 占位 |

### TC-4: Issues 内容预览

| 维度 | 内容 |
|------|------|
| **前置条件** | 存在至少 1 个有 `description` 的 Requirement Issue |
| **操作** | 查看该 Issue 在活动列表中的卡片 |
| **预期** | 活动项底部显示灰色预览块（`do-timeline-preview`），内容为 description 纯文本首段 |
| **验证方法** | 确认预览文本不含 Markdown `#` 标记 / HTML 标签 / 表格管道符 |
| **边界** | `description` 为 `undefined` 或空字符串时，不显示预览块 |

### TC-5: Bugs 内容预览

| 维度 | 内容 |
|------|------|
| **前置条件** | 存在至少 1 个有 `description` 的 Bug |
| **操作** | 查看该 Bug 在活动列表中的卡片 |
| **预期** | 活动项底部显示预览块，内容为 description 纯文本 |
| **边界** | `description` 为 `undefined` 或空时，不显示预览块 |

### TC-6: 文档预览回退链

| 维度 | 内容 |
|------|------|
| **前置条件** | 三类文档：(a) 有 `description` 的 PRD、(b) 有 `acceptance_criteria` 但无 `description` 的 PRD、(c) 有 `benefit` 但无前两者的架构文档 |
| **操作** | 分别观察三类文档的活动项预览 |
| **预期** | (a) 显示 description；(b) 显示第一条 acceptance_criteria；(c) 显示 benefit |
| **验证方法** | 确认非 string 类型的 `acceptance_criteria` 元素被跳过（不会出现 `[object Object]`） |

### TC-7: 预览文本长度限制

| 维度 | 内容 |
|------|------|
| **前置条件** | 存在 description 长度 > 150 字符的 Issue |
| **操作** | 查看预览文本 |
| **预期** | 文本 ≤ 150 字符 + `…`，且截断点在单词边界（非半词） |
| **验证方法** | DevTools 检查预览文本 `textContent.length ≤ 153` |

### TC-8: 类型检查

| 维度 | 内容 |
|------|------|
| **操作** | `cd YiVad && pnpm type:check` |
| **预期** | 零错误退出 |

---

## 回归检查

| 检查项 | 方法 |
|--------|------|
| 活动项点击仍正常打开文件预览 | 点击任意活动项 → `KnowledgePreviewDialog` 弹出 |
| 时间线骨架屏正常 | 强制 loading 状态 → 骨架动画正常 |
| 其他项目详情页不受影响 | 访问 `/project/yivad`、`/project/yiai` 确认活动模块正常 |
| Todo 列表功能正常 | 右侧 Todo 面板的 start/complete 按钮正常工作 |