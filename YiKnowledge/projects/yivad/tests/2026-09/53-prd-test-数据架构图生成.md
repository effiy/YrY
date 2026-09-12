---
doc_type: test
title: "YV-09-114: 数据架构图生成 — MongoDB 集合数据模型/Schema 可视化、实体关系图、字段级详情、关系连线、导出为图表、自动检测集合关系 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-114"
source_prds: ["53-prd-数据架构图生成"]
source_modules: []
---
# YV-09-114: 数据架构图生成 — MongoDB 集合数据模型/Schema 可视化、实体关系图、字段级详情、关系连线、导出为图表、自动检测集合关系 — 测试规格

> 来源 PRD：[53-prd-数据架构图生成.md](../../prds/2026-09/53-prd-数据架构图生成.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：ER 图渲染

**GIVEN** 后端返回 10 个集合的 Schema 和 15 条关系
**WHEN** 打开数据架构图页面
**THEN** 画布上显示 10 个矩形节点（每个显示集合名称）
**AND** 15 条关系连线显示在不同节点之间
**AND** 力导向布局自动排列节点，无重叠
**AND** 缩放/拖拽交互正常

### 场景 2：集合详情查看

**GIVEN** ER 图中显示 sessions 集合节点
**WHEN** 用户点击 sessions 节点
**THEN** 右侧面板展开 sessions 详情
**AND** 显示字段列表：key (string, 100%)、messages (array, 100%)、title (string, 80%) 等
**AND** 每个字段显示类型、出现频率、采样值
**AND** 外键字段标注目标集合

### 场景 3：关系检测 — 字段名匹配

**GIVEN** bugs 集合有 created_by 字段（值为 ObjectId）
**WHEN** Schema 服务检测关系
**THEN** 规则匹配 created_by → users 集合
**AND** 采样 10 个值在 users 集合查询
**AND** 若 7+ 个匹配，标记关系为 confirmed (confidence ≥ 0.7)
**AND** ER 图中 bugs → users 显示关系连线

### 场景 4：Mermaid ER 导出

**GIVEN** ER 图当前显示 5 个集合和 8 条关系
**WHEN** 用户选择导出为 Mermaid ER
**THEN** 生成 Mermaid 代码块，包含 erDiagram 声明
**AND** 每个集合列出字段和类型
**AND** 关系用正确语法表示（`||--o{` 一对多、`||--||` 一对一）
**AND** 复制到剪贴板的代码可在 Markdown 中正确渲染

### 场景 5：PNG 导出

**GIVEN** ER 图已渲染
**WHEN** 用户点击导出 PNG
**THEN** 生成包含完整图表的高清 PNG（2x 缩放）
**AND** PNG 尺寸覆盖所有节点（不裁剪）
**AND** 文件下载为 data_schema_2026-09-09.png

### 场景 6：字段类型推断

**GIVEN** sessions 集合中 title 字段有 3 种情况：string (80%)、null (15%)、缺失 (5%)
**WHEN** Schema 采样 100 条文档
**THEN** title 字段 inferred dominantType = "string"
**AND** frequency = 0.95（80%+15%，null 也算字段存在）
**AND** 标记 isRequired = false（不是 100% 存在）

---

