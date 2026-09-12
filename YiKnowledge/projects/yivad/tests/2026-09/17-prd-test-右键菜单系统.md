---
doc_type: test
title: "右键菜单系统 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-42"
source_prds: ["17-prd-右键菜单系统"]
source_modules: []
---
# 右键菜单系统 — 测试规格

> 来源 PRD：[17-prd-右键菜单系统.md](../../prds/2026-09/17-prd-右键菜单系统.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### Scenario 1: 右键菜单正常显示
- **GIVEN** 用户在数据表格页面，鼠标悬停在某一行上
- **WHEN** 用户右键点击该行
- **THEN** 浏览器默认菜单被阻止，自定义右键菜单在鼠标位置附近显示，包含"编辑"、"删除"、"复制"、"查看详情"等菜单项

### Scenario 2: 菜单自动翻转避免溢出
- **GIVEN** 用户在视口右下角右键点击一个元素
- **WHEN** 菜单默认位置超出视口边界
- **THEN** 菜单自动翻转到鼠标左上方，所有菜单项完全可见，不超出视口

### Scenario 3: 键盘导航菜单项
- **GIVEN** 右键菜单已显示，焦点在菜单上
- **WHEN** 用户按 ↓ 键 3 次，然后按 Enter 键
- **THEN** 高亮依次移动到第 1、第 2、第 3 个菜单项（跳过 disabled 和 divider），Enter 触发第 3 个菜单项的 action

### Scenario 4: 批量选中右键菜单
- **GIVEN** 用户在表格中选中了 3 行数据
- **WHEN** 用户右键点击其中任意一行
- **THEN** 菜单显示"批量删除 (3)"、"批量导出 (3)"、"批量分配 (3)"等批量操作项

### Scenario 5: 子菜单展开与关闭
- **GIVEN** 右键菜单包含"移动到"子菜单项
- **WHEN** 用户悬停在"移动到"上
- **THEN** 子菜单在右侧展开，显示"项目 A"、"项目 B"、"项目 C"等选项；鼠标移出子菜单区域后 300ms 自动关闭

### Scenario 6: 禁用项显示 tooltip
- **GIVEN** 右键菜单中"删除"项被标记为 disabled，disabledReason 为"无删除权限"
- **WHEN** 用户悬停在"删除"项上
- **THEN** 菜单项灰色显示，tooltip 显示"无删除权限"，点击不触发任何操作

---


## 补充：单元测试用例

### UT-CM01: useContextMenu

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 右键触发 | 右键点击目标元素 | 菜单在鼠标位置显示 |
| 2 | 自定义操作 | items=[{label:'编辑', action:fn}] | 点击触发对应 action |
| 3 | 条件显示 | item.visible=false | 该项不在菜单中显示 |
| 4 | 菜单关闭 | 点击菜单外区域 | 菜单消失 |
| 5 | 嵌套菜单 | 子菜单展开 | 子菜单渲染在正确位置 |
| 6 | Teleport | 菜单渲染位置 | 挂载到 body，避免 overflow hidden |

