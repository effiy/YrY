---
type: loop-index
title: 流程记录整合索引
category: okr
created: 2026-08-16
updated: 2026-08-16
status: active
---

# 🔁 流程记录整合索引（loop）

> 北极星：**AI 从需求到上线全流程自闭环**。
> 本目录记录每一次「需求评审 → 技术评审 → 构建调试 → 测试报告 → 上线」的完整闭环。

## 闭环一览

| 闭环 | 主题 | 状态 | 记录 |
|---|---|---|---|
| loop-001 | OKR 自闭环 + 流程记录页 | ✅ 已上线 | [01 需求评审](loop-001-okr-self-closed-loop/01-requirement-review.md) · [02 技术评审](loop-001-okr-self-closed-loop/02-technical-review.md) · [03 构建调试](loop-001-okr-self-closed-loop/03-build-debug.md) · [04 测试报告](loop-001-okr-self-closed-loop/04-test-report.md) · [05 上线记录](loop-001-okr-self-closed-loop/05-launch-record.md) · [📄 闭环报告](loop-001-okr-self-closed-loop/README.md) |

## 目录规范

```
loop/
├── INDEX.md                          # 本索引
├── _templates/                       # 5 类记录模板（type: loop-template）
│   ├── 01-requirement-review.md
│   ├── 02-technical-review.md
│   ├── 03-build-debug.md
│   ├── 04-test-report.md
│   └── 05-launch-record.md
└── loop-XXX-<slug>/                  # 每次闭环一个目录
    ├── 01-requirement-review.md      # 需求评审（PRD + 验收标准 + WSJF）
    ├── 02-technical-review.md        # 技术评审（ADR + 数据模型）
    ├── 03-build-debug.md             # 构建调试（问题→修复→验证 + 门禁）
    ├── 04-test-report.md             # 测试报告（门禁 + 手动验证）
    └── 05-launch-record.md           # 上线记录（artifact/version/env）
```

## 记录 frontmatter 规范

每条记录（`type: loop-record`）必填：

| 字段 | 取值 | 说明 |
|---|---|---|
| type | `loop-record` | 记录类型（模板为 `loop-template`） |
| loopId | `loop-XXX` | 闭环编号 |
| stage | `requirement-review` / `technical-review` / `build-debug` / `test-report` / `launch` | 闭环阶段 |
| title | 字符串 | 记录标题 |
| role | `producter`/`leader`/`engineer`/`srer`/`aier`/`curator`/`executiver` | 产出角色 |
| goalId | `xxx-XXX` | 关联目标 |
| status | `done` / `in-progress` | 状态 |
| created / updated | `YYYY-MM-DD` | 时间戳 |

## 复用方式

1. 复制 `_templates/` 对应模板到 `loop-XXX-<slug>/`。
2. 改 frontmatter 的 `loopId` / `title` / `goalId` / `status` / 日期。
3. 填正文（PRD / ADR / 调试记录 / 测试 / 上线信息）。
4. YiVad「流程记录」页（`/executiver/process`）自动聚合展示。
