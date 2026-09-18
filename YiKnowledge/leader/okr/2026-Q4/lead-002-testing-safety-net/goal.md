---
type: okr-goal
id: lead-002
title: 测试安全网建立
status: active
period: 2026 Q4
owner: Tech Lead
project: YiVad + YiPet
progress: 0
updated: 2026-09-15
---

# 测试安全网建立

> **目标简述**：在 YiVad 和 YiPet 中建立基础的自动化测试安全网，使功能变更可以在不引入回归的前提下进行。这是 Q3 技术债务（零测试覆盖）的集中偿还。

## 为什么这个目标重要

Q3 完成了 ADR 决策和框架选型（Vitest 引入、Biome 代码检查），但测试覆盖仍然为零。当前的变更风险模式不可持续——每次 ProTable 数据管线修改、每次 Agent 状态机调整都携带未知回归风险。Q4 是落地季。

此目标将测试从"零"推进到"有"——不追求覆盖率数字，追求**关键路径的安全保障**。

## 目标详情

| 字段 | 值 |
|---|---|
| ID | `lead-002` |
| 状态 | active |
| 周期 | 2026 Q4 |
| 负责人 | Tech Lead |
| 项目 | YiVad + YiPet |

## 关键结果 (4 个)

### KR1: YiVad composable 测试覆盖率 ≥ 60%

**当前**：0%  **目标**：≥ 60%  **权重**：35%

范围：
- `useAuthButtons` — 权限解析逻辑（最简单，最先做）
- `useTable` — 表格配置、分页、搜索状态
- `useSelection` — 行选择状态
- `useAgent` — Agent 会话管理（最复杂）

**测量**：`vitest --coverage` 中 composables 目录的行覆盖率。

### KR2: RPC 契约参数名称自动化验证

**当前**：手动检查  **目标**：CI 可运行的集成测试  **权重**：25%

范围：
- `callService.query_documents` 参数使用 `filter` 而非 `query`
- 文件操作使用 `target_file` 而非 `path`
- `data_service` collection 参数使用 `cname` 而非 `collection_name`

**测量**：至少 3 个契约测试，覆盖 3 个曾导致 bug 的参数名不匹配。

### KR3: Agent 状态机文档化 + 端到端测试

**当前**：无状态转换文档，无端到端测试  **目标**：状态转换图 + 核心生命周期测试  **权重**：25%

范围：
- 状态转换图 (Mermaid 或 ASCII)：create → confirm → steer → followup → resume
- 每个状态的进入条件、退出条件、可触发动作
- 完整生命周期端到端测试：create → confirm → steer → followup → max_turns → resume

**测量**：状态转换图可被非原作者理解。端到端测试覆盖至少 1 个完整生命周期。

### KR4: YiPet 双世界边界集成测试

**当前**：零集成测试  **目标**：关键消息类型有契约测试  **权重**：15%

范围：
- Content Script → Service Worker 消息格式验证
- Service Worker → Content Script 响应格式验证

**测量**：至少 3 个消息类型的集成测试。

## 成功标准判定

| 达成率 | 判定 |
|---|---|
| ≥ 70% | 达成——关键路径测试安全网建立 |
| 40-69% | 部分达成——至少 composable 测试已启动 |
| < 40% | 未达成——需分析阻塞原因 |

## 相关资源

- [ADR: Vitest 引入](../decisions/yivad/03-决策-Vitest引入.md)
- [技术债: YiVad 缺少测试框架](../architecture/05-架构-技术债-YiVad缺少测试框架.md)
- [技术战略 Q4 方向](../architecture/08-架构-技术战略-2026-Q4方向.md)
- [Q4 路线图预览](../roadmap/10-路线图-审查-2026-Q4预览.md)

## 进度追踪

| 日期 | KR1 | KR2 | KR3 | KR4 | 总体 | 备注 |
|---|---|---|---|---|---|---|
| 2026-09-15 | 0% | 0% | 0% | 0% | 0% | 目标设定 |
| | | | | | | |
| | | | | | | |