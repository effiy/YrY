---
title: 从管理后台移植智能体模式
tags: [功能, 智能体, 人工智能, 循环, 前端]
category: 问题/功能
created: 2026-08-05
updated: 2026-08-05
source: 内部
type: 问题
status: 待开始
priority: 中
问题type: 功能
project: YiPet
project_id: yipet
owner: 陈铭
estimate_points: 8
评审status: 待评审
prd_month: 202608
prd_task_id: 4
roles: [engineer]
---

# 从 YiVad 移植 Agent 模式

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 4 |
| 项目 | YiPet (Chrome MV3 Extension) |
| 代码仓库 | `YrY/YiPet` |
| 功能模块 | Chat → Agent |
| 优先级 | 中 |
| 人天 | 8.0d |
| 状态 | 待开始 |

### 功能概述

将 YiVad 的 Agent π Loop 模式移植至 YiPet 扩展 Chat 窗口，实现工具调用确认、实时工具生命周期展示、模型切换和轮次预算控制。

### 技术实现

#### 工具确认 UI

- 当 Agent 需要调用工具时，在 Chat 窗口中展示工具确认卡片
- 卡片内容：工具名称、参数列表、调用状态
- 用户可批准/拒绝/跳过工具调用
- 与 YiVad 行为保持一致

#### 工具生命周期

- 实时状态展示：`pending` → `executing` → `completed` / `failed`
- 执行中显示加载动画和耗时
- 完成后展示工具返回结果摘要
- 失败时展示错误信息和重试按钮

#### 模型切换

- 在 Chat 窗口顶部展示当前使用的模型
- 支持切换模型：Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5
- 切换后新消息使用新模型

#### 轮次预算

- 显示 Agent 当前轮次和总预算（如 3/10 turns）
- 接近预算上限时给出警告提示
- 超出预算自动中止

#### 适配要点

- 扩展窗口空间有限，UI 需紧凑设计（比 YiVad 更小尺寸）
- Content Script 环境限制：无 Node.js API，需通过 Service Worker 代理
- 通过 RPC envelope 与 YiAi 后端通信

### 关联模块

- 后端 API：`services.ai.chat_service.chat`（agent 模式）
- 前端组件：`ToolConfirmCard`、`ModelSwitcher`、`TurnBudget`
- 参考实现：YiVad `src/views/aiChat/`

### 验收标准

1. 工具确认 UI 在扩展 Chat 窗口中正常展示
2. 工具生命周期状态实时更新
3. 模型切换功能正常
4. 轮次预算显示正确，超限自动中止
5. 与 YiVad Agent 行为一致

---

*source: `projects/yipet/requires/2026-08/agent-mode-port-from-yivad.md`*