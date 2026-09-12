---
type: loop-index
title: 流程记录整合索引
category: okr
created: 2026-08-16
updated: 2026-09-10
status: active
---

# 🔁 流程记录整合索引（loop）

> 北极星：**AI 从需求到上线全流程自闭环**。
> 本目录记录每一次「需求评审 → 技术评审 → 代码审查 → 构建调试 → 测试报告 → 部署 → 上线记录 → 复盘总结」的完整闭环。

## 闭环一览

| 闭环 | 主题 | 状态 | 记录 |
|---|---|---|---|
| loop-001 | OKR 自闭环 + 流程记录页 | ✅ 已上线 | [01 需求评审](loop-001-okr-self-closed-loop/01-编排-requirement-review.md) · [02 技术评审](loop-001-okr-self-closed-loop/02-编排-technical-review.md) · [03 代码审查](loop-001-okr-self-closed-loop/03-编排-code-review.md) · [04 构建调试](loop-001-okr-self-closed-loop/04-编排-build-debug.md) · [05 测试报告](loop-001-okr-self-closed-loop/05-编排-test-report.md) · [06 部署](loop-001-okr-self-closed-loop/06-编排-deployment.md) · [07 上线记录](loop-001-okr-self-closed-loop/07-编排-launch-record.md) · [08 复盘](loop-001-okr-self-closed-loop/08-编排-retrospective.md) · [📄 闭环报告](loop-001-okr-self-closed-loop/README.md) |
| loop-002 | 模板复用与编排规范化 | ✅ 已上线 | [01 需求评审](loop-002-template-orchestration/01-编排-requirement-review.md) · [02 技术评审](loop-002-template-orchestration/02-编排-technical-review.md) · [03 代码审查](loop-002-template-orchestration/03-编排-code-review.md) · [04 构建调试](loop-002-template-orchestration/04-编排-build-debug.md) · [05 测试报告](loop-002-template-orchestration/05-编排-test-report.md) · [06 部署](loop-002-template-orchestration/06-编排-deployment.md) · [07 上线记录](loop-002-template-orchestration/07-编排-launch-record.md) · [08 复盘](loop-002-template-orchestration/08-编排-retrospective.md) · [📄 闭环报告](loop-002-template-orchestration/README.md) |

## 目录规范

```
loop/
├── INDEX.md                          # 本索引
├── _templates/                       # 8 类记录模板（type: loop-template）
│   ├── 01-编排-requirement-review.md
│   ├── 02-编排-technical-review.md
│   ├── 03-编排-code-review.md
│   ├── 04-编排-build-debug.md
│   ├── 05-编排-test-report.md
│   ├── 06-编排-deployment.md
│   ├── 07-编排-launch-record.md
│   └── 08-编排-retrospective.md
└── loop-XXX-<slug>/                  # 每次闭环一个目录
    ├── 01-编排-requirement-review.md      # 需求评审（PRD + 验收标准 + WSJF）
    ├── 02-编排-technical-review.md        # 技术评审（ADR + 数据模型）
    ├── 03-编排-code-review.md             # 代码审查（架构/类型/安全/性能/可维护）
    ├── 04-编排-build-debug.md             # 构建调试（问题→修复→验证 + 门禁）
    ├── 05-编排-test-report.md             # 测试报告（门禁 + 手动验证）
    ├── 06-编排-deployment.md              # 部署（部署步骤 + 验证 + 回滚预案）
    ├── 07-编排-launch-record.md           # 上线记录（artifact/version/env + 审批）
    └── 08-编排-retrospective.md           # 复盘总结（Keep/Improve/行动项）
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

## 适用场景

每一条闭环对应一次真实的"AI 从需求到上线"的完整旅程。启动新闭环的典型场景：

- **新功能开发** — 有新功能要从零开发到上线，用闭环记录全流程
- **系统重构** — 大规模重构需跟踪每个阶段的风险和决策
- **流程改进** — 改进知识库治理流程本身（如 loop-001、loop-002）
- **周期性目标** — 每季度/每月用一条闭环记录该周期的全流程产出

## 使用说明

1. **启动闭环** — 从闭环一览表中读取最新闭环编号（当前 loop-002），新闭环编号为 `loop-003-<slug>`
2. **创建目录** — `mkdir loop/loop-003-<slug>/`
3. **复制模板** — `cp loop/_templates/0* loop/loop-003-<slug>/`
4. **填充内容** — 按 8 阶段顺序逐一填写（不要求一次性完成，按流程节奏推进）
5. **更新索引** — 在本文档的闭环一览表中新增一行

## 8 阶段产出的质量门槛

每个阶段记录在进入下一阶段前需达到的最低标准：

| 阶段 | 不可跳过的内容 | 验证方式 |
|---|---|---|
| 需求评审 | PRD + 验收标准（至少 3 条） | Reviewer 确认 AC 可验证 |
| 技术评审 | ADR + 数据模型 | Tech Lead 批准 |
| 代码审查 | 5 维度审查 + 具体意见 | 审查结论为通过或有条件通过 |
| 构建调试 | 问题→修复→验证 + 门禁结果 | typecheck + build 双绿 |
| 测试报告 | 自动化门禁 + 关键场景手动验证 | 无阻塞性缺陷 |
| 部署 | 部署步骤 + 验证 + 回滚预案 | 所有验证项通过 |
| 上线记录 | 产物清单 + 审批 + 上线验证 | 全部审批通过 |
| 复盘总结 | Keep + Improve + 行动项 + 数据总结 | 行动项有负责人和截止日期 |

## 阶段间的依赖关系

```
需求评审 ──→ 技术评审 ──→ 代码审查 ──→ 构建调试 ──→ 测试报告 ──→ 部署 ──→ 上线记录 ──→ 复盘总结
    │                                                            │
    └── PRD 是所有下游阶段的输入                                   └── 测试报告是部署和上线的门禁
```

- 需求评审定义了"要做什么"，技术评审定义了"怎么做"
- 代码审查在构建之前完成（先审查再合并）
- 构建调试和测试报告可以部分并行（构建失败→调试→重新构建→测试）
- 部署和上线记录紧密相关：部署是执行记录（"做了什么"），上线是审批记录（"批准了什么"）

## 反模式

| 反模式 | 失效原因 | 正确做法 |
|---|---|---|
| 启动闭环但不填充内容 | 闭环目录空有结构，失去流程记录的意义 | 启动闭环时就承诺完成时间，每个阶段有截止日期 |
| 跳过复盘阶段 | 经验不能转化为改进，下次重复同样的错误 | 复盘是闭环的最后一环，不是可选项——不复盘等于白做 |
| 模板填充形式化 | PRD 只有一段话、ADR 没有替代方案、复盘没有行动项 | 每个模板的占位符都认真填充，走就绪检查清单 |
| 闭环与 OKR 脱节 | 流程记录和 OKR 目标各走各的，没有关联 | loop record 的 goalId 必须链接到实际的 OKR 目标