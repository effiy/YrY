---
doc_type: test
title: "YV-09-228: 项目合并 — 双项目合并、冲突解决、合并预览与撤销合并 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-228"
source_prds: ["82-prd-项目合并"]
source_modules: []
---
# YV-09-228: 项目合并 — 双项目合并、冲突解决、合并预览与撤销合并 — 测试规格

> 来源 PRD：[82-prd-项目合并.md](../../prds/2026-09/82-prd-项目合并.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：MergeConfigPanel

#### Scenario: 验证源项目和目标项目不能相同
- **GIVEN** 合并配置面板渲染
- **WHEN** 选择源项目为"A"，目标项目也为"A"
- **THEN** 显示错误提示"源项目和目标项目不能相同"

#### Scenario: 源项目处理选项
- **GIVEN** 选择了源项目和目标项目
- **WHEN** 选择"合并后归档源项目"
- **THEN** 提示"合并完成后源项目将被归档，不再活跃"

### 组件测试：MergeConflictResolver

#### Scenario: 同名标签冲突
- **GIVEN** 源项目和目标项目都有标签"bug"
- **WHEN** 渲染冲突解决面板
- **THEN** 显示冲突项，展示目标标签"bug"和源标签"bug"
- **THEN** 提供"保留目标"、"使用源覆盖"、"保留两者"选项

#### Scenario: 批量选择保留目标
- **GIVEN** 有 5 个冲突项
- **WHEN** 点击"全部保留目标"
- **THEN** 所有冲突项选择"保留目标"

### 组件测试：MergePreview

#### Scenario: 合并预览数据统计
- **GIVEN** 源项目有 20 个 Issue、5 个标签、3 个成员
- **WHEN** 渲染合并预览
- **THEN** 显示"将新增 20 个 Issue、5 个标签、3 个成员"
- **THEN** 显示冲突数量（如有）

### 集成测试：ProjectMerge

#### Scenario: 完整合并流程
- **GIVEN** 配置合并：源项目"前端旧版" → 目标项目"前端新版"
- **WHEN** 点击合并预览，解决 3 个冲突，确认合并
- **THEN** 合并完成，目标项目新增源项目的数据
- **THEN** 源项目按配置归档/保留/删除
- **THEN** 合并历史记录正确

#### Scenario: 撤销合并
- **GIVEN** 合并完成不到 7 天
- **WHEN** 点击"撤销合并"
- **THEN** 目标项目恢复到合并前状态
- **THEN** 源项目恢复到合并前状态
- **THEN** 合并记录标记为"已撤销"

---

