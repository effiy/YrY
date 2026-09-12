---
doc_type: test
title: "YV-09-87: 智能搜索过滤器 — 自然语言查询、保存过滤预设、过滤器分享、使用模式建议、语法高亮、布尔组合(AND/OR/NOT) — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-87"
source_prds: ["40-prd-智能搜索过滤器"]
source_modules: []
---
# YV-09-87: 智能搜索过滤器 — 自然语言查询、保存过滤预设、过滤器分享、使用模式建议、语法高亮、布尔组合(AND/OR/NOT) — 测试规格

> 来源 PRD：[40-prd-智能搜索过滤器.md](../../prds/2026-09/40-prd-智能搜索过滤器.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：自然语言解析 — 简单查询

**GIVEN** 用户在自然语言输入框中输入 "高优先级 bug"
**WHEN** 规则引擎解析
**THEN** 应解析为 `priority:high AND status:bug`
**AND** DSL 编辑器同步显示 "priority:high status:bug"
**AND** GUI 面板显示两个过滤条件（priority=high, status=bug, 逻辑=AND）

### 场景 2：自然语言解析 — 复杂查询触发 LLM

**GIVEN** 用户输入 "跟支付相关的那个紧急问题"
**WHEN** 规则引擎无法完全解析（unmatched = ["支付", "紧急"]）
**THEN** 标记 needsLLM = true
**AND** 异步调用 YiAi LLM 解析
**AND** 显示 loading 状态（骨架屏）
**AND** LLM 返回 `tags:payment priority:urgent` 后更新过滤器

### 场景 3：DSL 编辑器语法高亮

**GIVEN** 用户在 DSL 编辑器中输入 "NOT status:closed (priority:high OR priority:urgent)"
**WHEN** 实时词法分析
**THEN** NOT 应显示为紫色粗体
**AND** status 应显示为蓝色
**AND** closed 应显示为绿色
**AND** 括号应显示为灰色
**AND** OR 应显示为紫色粗体

### 场景 4：GUI 和 DSL 双向同步

**GIVEN** 在 GUI 中添加条件 `status = bug`，逻辑为 AND
**WHEN** 查看 DSL 编辑器
**THEN** DSL 应显示 "status:bug"
**WHEN** 在 DSL 编辑器中追加 " OR status:issue"
**THEN** GUI 应显示 OR 分组，包含两个 status 条件

### 场景 5：保存和加载过滤预设

**GIVEN** 当前过滤器为 "assignee:@me priority:high status:bug"
**WHEN** 用户点击"保存预设"，输入名称"我的高优 bug"
**AND** 选择可见性为"团队"
**THEN** 预设保存到后端
**AND** 团队成员在预设列表中可见"我的高优 bug"
**WHEN** 团队成员点击加载该预设
**THEN** 过滤器自动应用为 "assignee:@me priority:high status:bug"

### 场景 6：过滤器 URL 分享

**GIVEN** 当前过滤器为 "status:bug priority:high"
**WHEN** 用户点击"复制链接"
**THEN** 生成 URL: `yivad/bugs?filter=eyJzdGF0dXMiOiJidWciLCJwcmlvcml0eSI6ImhpZ2gifQ==`
**AND** 剪贴板中应复制完整 URL
**WHEN** 其他用户打开该 URL
**THEN** 自动应用过滤器 "status:bug priority:high"
**AND** SmartFilterBar 显示当前的过滤条件

---

