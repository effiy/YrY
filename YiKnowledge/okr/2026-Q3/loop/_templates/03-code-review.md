---
type: loop-template
loopId: loop-XXX
stage: code-review
title: <代码审查主题>
role: leader
goalId: lead-XXX
status: in-progress
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [loop-record, code-review]
---

# 03 代码审查 — loop-XXX

> 需求编号：loop-XXX · 审查人：<Tech Lead> · 状态：<进行中/已通过>

## 审查范围

| 仓库 | 分支/提交 | 改动文件数 | 说明 |
|---|---|---|---|
| <repo> | <branch> | <n> | <说明> |

## 审查维度

| 维度 | 结果 | 说明 |
|---|---|---|
| 架构/模块边界 | ✅/⚠️/❌ | <说明> |
| 类型安全（TypeScript strict） | ✅/⚠️/❌ | <说明> |
| 安全（OWASP/注入/敏感信息） | ✅/⚠️/❌ | <说明> |
| 性能（渲染/内存/网络） | ✅/⚠️/❌ | <说明> |
| 可维护性（命名/复用/注释） | ✅/⚠️/❌ | <说明> |
| 测试覆盖 | ✅/⚠️/❌ | <说明> |

## 具体意见

| # | 文件 | 行/区域 | 等级 | 意见 | 处置 |
|---|---|---|---|---|---|
| 1 | <path> | <Lxx> | 🔴/🟡/🟢 | <意见> | 已修复/待讨论/接受 |

## 审查结论

- **结果**: ✅ 通过 / ⚠️ 有条件通过 / ❌ 需返工
- **阻塞项**: <n> 项
- **建议项**: <n> 项
- **审查人签字**: <Name>