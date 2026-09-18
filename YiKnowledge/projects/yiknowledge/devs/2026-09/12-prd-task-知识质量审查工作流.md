---
doc_type: module
prd_task_id: "YK-09-09"
title: "YK-09-09: 知识质量审查工作流 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "12-架构设计-知识质量审查工作流.md"
source_okr: [yiknowledge-001]
related_tests: ["12-prd-test-知识质量审查工作流"]
---

# YK-09-09: 知识质量审查工作流 — 开发方案

> 来源 PRD：[12-架构设计-知识质量审查工作流.md](../../prds/2026-09/12-架构设计-知识质量审查工作流.md)
> 需求编号：YK-09-09 · 优先级：P2 · 人天：1.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

自动化审查工作流：文档提交 → 运行检查清单（复用 YK-09-01 frontmatter 校验 + YK-09-03 命名规范 + M20 15 项检查）→ SLA 计时 → 审查分配 → 通过/驳回 → 通知。

### 文件清单

```
YiAi/src/
├── services/knowledge/
│   └── review_workflow_service.py  # 【新增】审查工作流 API
└── domain/knowledge/
    └── review_sla.py               # 【新增】SLA 追踪引擎
```

---

## 二、关键技术决策

### D-01：SLA 按文档优先级差异化

| priority | SLA (审查时长) | 超时动作 |
|----------|---------------|---------|
| P0 | 24h | 企微通知策展人 + 自动升级 |
| P1 | 72h | 企微提醒审查人 |
| P2 | 7d | 每周汇总提醒 |

### D-02：检查清单复用现有模块

不重复实现检查逻辑。`run_checks()` 编排调用 YK-09-01 (`validate_frontmatter`)、YK-09-03 (`check-naming.sh`)、M20 (`ReviewChecklist.run_all`)，统一汇总结果。

---

## 三、实现规格

```python
class ReviewWorkflowService:
    async def submit_for_review(self, file_path: str, priority: str) -> ReviewTask: ...
    async def run_automated_checks(self, file_path: str) -> ChecklistResult:
        """编排调用: frontmatter 校验 + 命名规范 + 15 项审查清单"""
    async def assign_reviewer(self, task_id: str) -> str: ...
    async def approve(self, task_id: str, reviewer: str) -> None: ...
    async def reject(self, task_id: str, reason: str) -> None: ...

class SLATracker:
    def get_remaining(self, task: ReviewTask) -> timedelta: ...
    def get_overdue_tasks(self) -> list[ReviewTask]: ...
    async def send_escalation(self, task: ReviewTask) -> None: ...  # 超时升级通知
```

---

## 四、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | SLA 引擎（计时/超时/升级） | 0.3 |
| 2 | 审查工作流 API（提交/分配/审批/驳回） | 0.4 |
| 3 | 检查清单编排（复用 YK-09-01/03 + M20） | 0.3 |
| 4 | 企微通知（分配/超时/审批结果） | 0.2 |
| 5 | 集成测试 | 0.3 |

**总计：1.5d**

---

## 五、技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 检查清单编排中某模块不可用 | 低 | 中 | 各检查独立 try-catch，失败项标记 "unavailable" |

---

## 六、实现完成记录

> **状态**：需求已编写，尚未开始实施。

---

## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 审查仪表盘 | 策展人无法查看等待审查的文档队列 | YiVad 前端页面 |

### 7.2 技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | SLA 计时依赖服务持续运行 | P3 | 服务重启后 SLA 计时器重置 | 待实施（MongoDB TTL 索引兜底） |

---