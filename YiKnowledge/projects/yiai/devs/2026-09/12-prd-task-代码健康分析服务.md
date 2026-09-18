---
doc_type: module
prd_task_id: "YA-09-33"
title: "YA-09-33: 代码健康分析 — 规模/复杂度/重复/覆盖率扫描 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "12-需求-代码健康分析服务.md"
source_okr: [yiai-001]
related_tests: ["12-prd-test-代码健康分析服务"]
---

# YA-09-33: 代码健康分析 — 规模/复杂度/重复/覆盖率扫描 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[12-需求-代码健康分析服务.md](../../prds/2026-09/12-需求-代码健康分析服务.md)
> 需求编号：YA-09-33 · 优先级：P2 · 人天：1.5d · 状态：已完成

---

<a id="sec-1"></a>
## 一、方案

`services/code_health_service.py`（已有）的增强版——自动化扫描 YrY 单体仓库的四个项目，生成代码健康报告。

### 扫描维度

| 维度 | 工具 | 指标 |
|------|------|------|
| 规模 | `cloc` / `os.walk` | 文件数、代码行数、注释率 |
| 复杂度 | `radon cc` | 圈复杂度 > 10 的函数 |
| 重复 | `jscpd` / `simian` | 重复代码块 (≥ 6 行) |
| 覆盖率 | `pytest-cov` / `vitest --coverage` | 行覆盖率和分支覆盖率 |
| 依赖 | `pip-audit` / `pnpm audit` | 过期依赖、已知漏洞 |

### API

```
GET /code-health/report?project=yiai&since=7d
→ { score: 85, dimensions: {...}, trends: [...], recommendations: [...] }
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | radon + cloc 集成 | 复杂度报告可生成 | 0.5 |
| 2 | 重复代码检测 + 趋势存储 | 历史趋势可对比 | 0.5 |
| 3 | Dashboard 展示 + 测试 | YiVad 可查看健康报告 | 0.5 |

**合计：1.5d**。

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 重复代码检测仅文本级 | P3 | 0.3 | 未使用 AST 级检测 | 待实施 |
| 2 | 覆盖率报告无趋势对比 | P3 | 0.2 | 仅展示当前值 | 待实施 |
