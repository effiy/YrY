---
doc_type: test
title: "YV-09-106: 用户角色与权限矩阵 — 权限矩阵可视化、角色-权限网格、角色对比视图、权限继承可视化、有效权限计算器、权限审计日志 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-106"
source_prds: ["50-prd-用户角色与权限矩阵"]
source_modules: []
---
# YV-09-106: 用户角色与权限矩阵 — 权限矩阵可视化、角色-权限网格、角色对比视图、权限继承可视化、有效权限计算器、权限审计日志 — 测试规格

> 来源 PRD：[50-prd-用户角色与权限矩阵.md](../../prds/2026-09/50-prd-用户角色与权限矩阵.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：权限矩阵渲染

**GIVEN** 系统有 5 个角色和 20 个权限
**WHEN** 打开权限矩阵页面（按角色查看）
**THEN** 渲染 5 行 x 20 列的网格表
**AND** 每个单元格显示正确的权限状态（✓/○/—）
**AND** 行悬停时高亮整行
**AND** 列悬停时高亮整列

### 场景 2：权限继承展开

**GIVEN** 权限树定义：`user:write` → `user:read`，`user:delete` → `user:read`
**WHEN** 角色 A 拥有 `user:write`（无 `user:read`）
**THEN** 有效权限计算显示：直接 = [`user:write`]，继承 = [`user:read`]
**AND** `user:read` 单元格显示为"继承获得"（○）

### 场景 3：多角色有效权限

**GIVEN** 用户拥有 2 个角色：角色 A 有 `user:read`、角色 B 有 `user:write`
**WHEN** 在有效权限计算器中查询该用户
**THEN** 有效权限 = [`user:read`, `user:write`]（并集）
**AND** `user:read` 来源 = [`角色A`]
**AND** `user:write` 来源 = [`角色B`]

### 场景 4：角色对比

**GIVEN** 角色 Admin: [`user:*`, `project:*`]，角色 Editor: [`project:read`, `project:write`, `content:*`]
**WHEN** 对比 Admin 和 Editor
**THEN** Venn 图显示重叠度为约 20%
**AND** 差异列表显示 "Admin 有 Editor 没有: [`user:*`]"
**AND** "Editor 有 Admin 没有: [`content:*`]"
**AND** "两者都有: [`project:read`, `project:write`]"

### 场景 5：权限审计日志

**GIVEN** 管理员授予用户 Bob "Editor" 角色，原因为 "需要管理内容"
**WHEN** 查看审计日志
**THEN** 日志条目显示：操作人=管理员、目标用户=Bob、操作=授予角色、角色=Editor、原因="需要管理内容"、时间戳正确
**AND** 按用户筛选只看到 Bob 的相关日志

### 场景 6：角色重叠度热力图

**GIVEN** 5 个角色的权限矩阵
**WHEN** 查看角色重叠度图表
**THEN** 展示 5x5 热力图，对角线为 100%
**AND** 任何两个角色的重叠度值显示在对应的 (i, j) 单元格
**AND** 颜色从绿（100%）到红（0%）渐变

---

