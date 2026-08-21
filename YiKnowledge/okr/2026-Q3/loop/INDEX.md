---
type: loop-index
title: 流程记录整合索引
category: okr
created: 2026-08-16
updated: 2026-08-17
status: active
---

# 🔁 流程记录整合索引（loop）

> 北极星：**AI 从需求到上线全流程自闭环**。
> 本目录记录每一次「需求评审 → 技术评审 → 代码审查 → 构建调试 → 测试报告 → 部署 → 上线记录 → 复盘总结」的完整闭环。

## 闭环一览

| 闭环 | 主题 | 状态 | 记录 |
|---|---|---|---|
| loop-001 | OKR 自闭环 + 流程记录页 | ✅ 已上线 | [01 需求评审](loop-001-okr-self-closed-loop/01-requirement-review.md) · [02 技术评审](loop-001-okr-self-closed-loop/02-technical-review.md) · [03 代码审查](loop-001-okr-self-closed-loop/03-code-review.md) · [04 构建调试](loop-001-okr-self-closed-loop/04-build-debug.md) · [05 测试报告](loop-001-okr-self-closed-loop/05-test-report.md) · [06 部署](loop-001-okr-self-closed-loop/06-deployment.md) · [07 上线记录](loop-001-okr-self-closed-loop/07-launch-record.md) · [08 复盘](loop-001-okr-self-closed-loop/08-retrospective.md) · [📄 闭环报告](loop-001-okr-self-closed-loop/README.md) |
| loop-002 | 模板复用与编排规范化 | ✅ 已上线 | [01 需求评审](loop-002-template-orchestration/01-requirement-review.md) · [02 技术评审](loop-002-template-orchestration/02-technical-review.md) · [03 代码审查](loop-002-template-orchestration/03-code-review.md) · [04 构建调试](loop-002-template-orchestration/04-build-debug.md) · [05 测试报告](loop-002-template-orchestration/05-test-report.md) · [06 部署](loop-002-template-orchestration/06-deployment.md) · [07 上线记录](loop-002-template-orchestration/07-launch-record.md) · [08 复盘](loop-002-template-orchestration/08-retrospective.md) · [📄 闭环报告](loop-002-template-orchestration/README.md) |

## 目录规范

```
loop/
├── INDEX.md                          # 本索引
├── _templates/                       # 8 类记录模板（type: loop-template）
│   ├── 01-requirement-review.md
│   ├── 02-technical-review.md
│   ├── 03-code-review.md
│   ├── 04-build-debug.md
│   ├── 05-test-report.md
│   ├── 06-deployment.md
│   ├── 07-launch-record.md
│   └── 08-retrospective.md
└── loop-XXX-<slug>/                  # 每次闭环一个目录
    ├── 01-requirement-review.md      # 需求评审（PRD + 验收标准 + WSJF）
    ├── 02-technical-review.md        # 技术评审（ADR + 数据模型）
    ├── 03-code-review.md             # 代码审查（架构/类型/安全/性能/可维护）
    ├── 04-build-debug.md             # 构建调试（问题→修复→验证 + 门禁）
    ├── 05-test-report.md             # 测试报告（门禁 + 手动验证）
    ├── 06-deployment.md              # 部署（部署步骤 + 验证 + 回滚预案）
    ├── 07-launch-record.md           # 上线记录（artifact/version/env + 审批）
    └── 08-retrospective.md           # 复盘总结（Keep/Improve/行动项）
```

## 记录 frontmatter 规范

每条记录（`type: loop-record`）必填：

| 字段 | 取值 | 说明 |
|---|---|---|
| type | `loop-record` | 记录类型（模板为 `loop-template`，索引为 `loop-index`，闭环报告为 `loop-summary`） |
| loopId | `loop-XXX` | 闭环编号 |
| stage | `requirement-review` / `technical-review` / `code-review` / `build-debug` / `test-report` / `deployment` / `launch` / `retrospective` | 闭环阶段 |
| title | 字符串 | 记录标题 |
| role | `producter`/`leader`/`engineer`/`srer`/`aier`/`curator`/`executiver` | 产出角色 |
| goalId | `xxx-XXX` | 关联目标 |
| status | `done` / `in-progress` | 状态 |
| created / updated | `YYYY-MM-DD` | 时间戳 |

## 复用方式

1. 复制 `_templates/` 对应模板到 `loop-XXX-<slug>/`。
2. 改 frontmatter 的 `loopId` / `title` / `goalId` / `status` / 日期。
3. 填正文（PRD / ADR / 审查意见 / 调试记录 / 测试 / 部署 / 上线 / 复盘）。
4. YiVad「流程记录」页（`/executiver/process`）自动聚合展示。