---
type: okr-kr
id: lead-002-kr1
title: KR1 — YiVad Composable 测试覆盖率 ≥ 60%
parent: lead-002
status: active
progress: 0
updated: 2026-09-15
---

# KR1: YiVad Composable 测试覆盖率 ≥ 60%

> **父目标**：[测试安全网建立](./goal.md) | **权重**：35%

## 当前状态

| 指标 | 值 |
|---|---|
| 当前覆盖率 | 0% |
| 目标覆盖率 | ≥ 60% |
| 目标 composable 数 | 4 (`useAuthButtons`, `useTable`, `useSelection`, `useAgent`) |

## 执行计划

| 顺序 | Composable | 复杂度 | 预估工作量 | 风险 |
|---|---|---|---|---|
| 1 | `useAuthButtons` | 低 | 0.5 天 | 低——纯函数逻辑，权限解析规则明确 |
| 2 | `useSelection` | 低 | 0.5 天 | 低——行选择状态管理 |
| 3 | `useTable` | 中 | 1-2 天 | 中——依赖 ProTable 配置和 API mock |
| 4 | `useAgent` | 高 | 1-2 天 | 高——多轮协议状态机，需 mock SSE 流 |

**策略**：从最简单开始建立信心和模式，前两个完成后评估时间和调整后两个的估算。

## 进度记录

| 日期 | 进度 | 备注 |
|---|---|---|
| 2026-09-15 | 0% | KR 定义完成 |
| | | |