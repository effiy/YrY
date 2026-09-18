---
doc_type: test
title: "YK-09-05: 项目知识中心完善 — 测试用例"
status: 进行中
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-05"
source_prds: ["08-功能实现-项目知识中心"]
source_modules: ["08-prd-task-项目知识中心"]
source_okr: [yiknowledge-001]
---

# YK-09-05: 项目知识中心完善 — 测试用例

> 来源 PRD：[08-功能实现-项目知识中心.md](../../prds/2026-09/08-功能实现-项目知识中心.md)
> 开发方案：[08-prd-task-项目知识中心.md](../../devs/2026-09/08-prd-task-项目知识中心.md)
> 需求编号：YK-09-05 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖统一分类、跨项目关联、跨项目检索、统计仪表盘。

---

## 一、测试范围

| 域 | 测试重点 |
|----|---------|
| 统一分类 | 4 项目 Bug frontmatter 字段一致性 |
| 跨项目关联 | SimHash 相似检测、跨项目引用建议 |
| 跨项目检索 | 移除项目过滤后结果正确、延迟 |
| 统计仪表盘 | Bug 统计准确性、INDEX.md 同步 |

---

## 二、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-CP-01 | SimHash 跨项目相似检测 | yiai Bug (RPC 参数名错误) + yivad Bug (RPC 参数名错误) | 汉明距离 ≤ 3 → 标记为关联 |
| UT-CP-02 | 不同 Bug 不关联 | RPC Bug + Canvas Bug | 汉明距离 > 10 → 不关联 |
| UT-CP-03 | 关联建议排序 | 5 个候选关联 | 按汉明距离升序（最相似在前） |
| UT-CP-04 | 跨项目检索无项目过滤 | `search_all_projects("RPC 参数")` | 结果来自多个项目（非单一） |
| UT-CP-05 | 跨项目检索结果标注来源 | 检索结果 | 每项标注 `project` 字段 |
| UT-CP-06 | Bug 统计准确性 | 4 项目 Bug 目录 | total/open/resolved 与实际文件数一致 |
| UT-CP-07 | 跨项目模式提取 | 扫描 4 项目 Bug | 相同根因模式被聚合（如 "参数名不匹配" 出现在 2+ 项目） |

---

## 三、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-CP-01 | 跨项目相似 Bug 关联→双向链接 | yiai Bug → `find_related` → 发现 yivad Bug → `cross_project_refs` 双向更新 |
| IT-CP-02 | 跨项目检索性能 | 4 项目统一检索 → 延迟增加 < 10%（vs 单项目） |
| IT-CP-03 | INDEX.md 统计更新 | Bug 增删后 → INDEX.md 自动刷新统计 |
| IT-CP-04 | 前端跨项目开关 | YiVad 知识库页面 → 开启跨项目 → 结果跨项目显示 |

---

## 四、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 跨项目检索导致搜索崩溃 | 移除项目过滤后 500 |
| S1 — 严重 | 跨项目关联错误 | 不相关 Bug 被 SimHash 误关联（汉明距离 ≤ 2 但内容无关） |
| S2 — 一般 | 统计仪表盘数据过期 | INDEX.md 显示 Bug 数与实际文件数不一致 > 5% |

---

## 五、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| SimHash 跨项目检测 | 复用 M20 | 已验证的 SimHash 实现 |
| 跨项目检索 | 待实施 | RAG 引擎已有能力，仅移除 filter |
| Bug 统计 | 待实施 | 文件系统扫描 + count |
| 前端开关 | 待实施 | YiVad 组件改动 |

---