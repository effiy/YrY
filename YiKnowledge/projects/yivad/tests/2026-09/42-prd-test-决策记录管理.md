---
doc_type: test
title: "YV-09-93: 决策记录管理 — ADR 管理、ADR 模板、ADR 状态流转(提案/已接受/已弃用/已取代)、ADR 关联 Issue/项目、ADR 搜索与筛选、ADR 时间线可视化 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-93"
source_prds: ["42-prd-决策记录管理"]
source_modules: []
---
# YV-09-93: 决策记录管理 — ADR 管理、ADR 模板、ADR 状态流转(提案/已接受/已弃用/已取代)、ADR 关联 Issue/项目、ADR 搜索与筛选、ADR 时间线可视化 — 测试规格

> 来源 PRD：[42-prd-决策记录管理.md](../../prds/2026-09/42-prd-决策记录管理.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：创建 ADR

**GIVEN** 用户打开 ADR 创建页面
**WHEN** 选择"Nygard 完整格式"模板
**AND** 填写标题="使用 ECharts 替换 Chart.js"、领域=技术选型
**AND** Context="Chart.js 功能有限，无法满足数据可视化需求"
**AND** Decision="全项目统一使用 ECharts 5.x"
**AND** Consequences="正面：功能增强、社区活跃；负面：包体积增加 200KB"
**AND** 添加备选方案 A：D3.js（拒绝理由：学习曲线太陡）
**AND** 保存
**THEN** ADR 创建成功，状态为"提案"
**AND** 自动分配编号（如 ADR-0021）

### 场景 2：状态流转

**GIVEN** ADR-0021 状态为"提案"
**WHEN** 用户点击"接受"并填写决定日期 2026-01-20
**THEN** 状态变为"已接受"
**AND** 决定日期记录为 2026-01-20
**AND** 时间线中该 ADR 节点颜色从黄色（提案）变为绿色（已接受）

### 场景 3：ADR 取代关系

**GIVEN** ADR-0021（已接受）需要被新方案取代
**WHEN** 在 ADR-0021 详情页点击"创建取代 ADR"
**THEN** 自动打开创建页面，预设 supersedes_adr_id = ADR-0021
**WHEN** 用户填写新 ADR 并保存
**THEN** ADR-0022 创建成功，supersedes_adr_id = ADR-0021
**AND** ADR-0021 状态自动变为"已取代"，superseded_by_adr_id = ADR-0022
**AND** 时间线中显示 ADR-0021 → ADR-0022 取代箭头

### 场景 4：搜索 ADR

**GIVEN** 系统中有 30 条 ADR
**WHEN** 用户搜索"图表"
**THEN** 返回所有标题/context/decision 中包含"图表"的 ADR
**AND** 搜索结果按相关度排序
**WHEN** 用户按领域筛选"技术选型"
**THEN** 仅显示领域为技术选型的 ADR

### 场景 5：时间线可视化

**GIVEN** 项目有 20 条 ADR 分布在 6 个月内
**WHEN** 用户打开时间线视图
**THEN** 水平时间轴按月份显示节点
**AND** 领域按 Y 轴分组
**AND** 取代关系用箭头连接
**AND** 缩放至"月"视图时节点按周分布

### 场景 6：导出 Markdown

**GIVEN** ADR-0021 处于"已接受"状态
**WHEN** 用户点击"导出 Markdown"
**THEN** 生成标准格式的 Markdown 文件
**AND** frontmatter 包含 title/status/domain/created/decided
**AND** 内容包含 Context/Decision/Consequences/Alternatives
**AND** 可选择"下载文件"或"保存到 YiKnowledge"

---

