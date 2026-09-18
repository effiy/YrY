---
doc_type: test
title: "YA-08-03: 测试覆盖率扩展 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-03"
source_prds: ["03-需求-测试覆盖率扩展"]
source_modules: ["03-prd-task-测试覆盖率扩展"]
source_okr: [yiai-003]
---

# YA-08-03: 测试覆盖率扩展 — 测试规格

> 来源 PRD：[03-需求-测试覆盖率扩展.md](../../prds/2026-08/03-需求-测试覆盖率扩展.md)
> 开发方案：[03-prd-task-测试覆盖率扩展.md](../../devs/2026-08/03-prd-task-测试覆盖率扩展.md)
> 需求编号：YA-08-03 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。验证 pytest 基础设施、76 个测试、92%+ 覆盖率。

---

## 一、覆盖率验证

| 编号 | 模块 | 目标覆盖率 | 当前 |
|------|------|----------|------|
| CV-01 | `shared/error_codes.py` | 100% | 100% |
| CV-02 | `shared/exceptions.py` | 100% | 100% |
| CV-03 | `shared/response.py` | 100% | 100% |
| CV-04 | `shared/utils.py` | ≥ 90% | 93% |
| CV-05 | `shared/config.py` | ≥ 90% | 92% |
| CV-06 | shared 综合 | ≥ 80% | 92%+ |

---

## 二、pytest 基础设施

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-PT-01 | `python -m pytest` 可执行 | 76 个测试全部 pass |
| UT-PT-02 | `--cov` 覆盖率报告 | html 报告生成到 `htmlcov/` |
| UT-PT-03 | CI 门禁 lines ≥ 80% | 低于 80% → CI 失败 |
| UT-PT-04 | `YiAi_ENV=test` 隔离 | 测试不写入生产 MDB |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 测试写入生产 MDB（环境隔离失败） |
| S2 — 一般 | 覆盖率降至 < 80%（CI 门禁被绕过） |

---