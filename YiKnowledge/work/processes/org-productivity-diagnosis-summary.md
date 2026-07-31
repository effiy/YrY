---
title: 组织效能诊断（摘要）
tags: [组织, 效能, Conway, 摘要]
category: work/processes
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 组织效能诊断（Org Productivity Diagnosis）摘要

> 本摘要说明诊断方法与解读；空白可填表单见 [org-productivity-diagnosis-template.md](./org-productivity-diagnosis-template.md)。

## 1. 是什么

对工程组织做体检，看四件事：

1. **团队拓扑**（Team Topology）：团队如何分工
2. **依赖拓扑**：团队之间如何互相依赖
3. **交付瓶颈**：交付流程在哪个环节卡住
4. **Conway 对齐**：组织结构与架构边界是否匹配

## 2. 为什么做

团队效能问题往往不在个人，而在结构：

- 5 个团队改同一服务，互相等待
- 一个团队依赖 3 个其他团队，每次 PR 都要跨组评审
- 团队职责与架构边界不对齐，导致代码 ownership 模糊
- 决策要 3 层批准，等一个月

组织效能诊断把这些结构性问题显性化，便于决策者看到瓶颈。

## 3. 团队拓扑

### 4 种团队类型（Matthew Skelton, Team Topologies）

| 类型 | 职责 |
|---|---|
| Stream-aligned 团队 | 沿业务流交付，跨职能独立 |
| Platform 团队 | 提供内部平台，让 stream 团队自服务 |
| Enabling 团队 | 临时帮助 stream 团队提升能力 |
| Complicated-subsystem 团队 | 处理复杂子系统（如算法） |

健康拓扑：大部分是 stream-aligned，少量 platform，少数 enabling / subsystem。

### 不健康信号

- 一个团队横跨多个业务流（职责过宽）
- 多个团队都改同一服务（ownership 模糊）
- 没有 platform 团队，每个 stream 团队自建基础设施
- Enabling 团队变成长期依赖（应该短期）

## 4. 依赖拓扑

画团队依赖图：

- 谁 → 依赖 → 谁
- 强依赖（同步等待） vs 弱依赖（异步消费 API）
- 依赖环（A 依赖 B，B 依赖 A）

### 不健康信号

- 依赖环 → 拆不开，重构难
- 中心团队（所有人都依赖它） → 单点瓶颈
- 跨多级依赖（A → B → C → D）→ 链长易断

### 解决

- 平台化（把强依赖改成消费平台）
- API 化（把同步等待改成异步消费）
- 合并（强依赖到不可分时合并团队）
- 拆分（中心团队拆成多个，按业务流对齐）

## 5. 交付瓶颈

### 拆解交付流

```
需求 → 设计 → 开发 → 评审 → 测试 → 灰度 → 上线 → 监控
```

每段标：瓶颈指数（队列长度 × 等待时间）

### 常见瓶颈

| 阶段 | 瓶颈 | 原因 |
|---|---|---|
| 需求 | 评审会排不上 | PM 资源不足、评审流程重 |
| 设计 | 设计师单点 | 1 个设计师服务 5 个团队 |
| 评审 | PR 等 3 天 | 资深开发评审负担重 |
| 测试 | 测试环境不够 | 环境隔离不足、资源紧张 |
| 灰度 | 灰度流程长 | 多审批、跨团队确认 |
| 上线 | 发布窗口少 | 高峰期冻结、流程长 |
| 监控 | 告警无人看 | Oncall 轮值不明确 |

### 解决

- 拆队列（每段并行化、异步化）
- 自动化（CI / 自动测试 / 自动部署）
- 自服务（让 stream 团队自部署）
- 简化流程（减少不必要的审批）

## 6. Conway 对齐

Conway 定律：**系统设计 = 组织沟通结构**。

如果组织结构与架构边界不一致：

- 团队 A 改服务 X 前端、团队 B 改 X 后端 → X 内部耦合高、改动慢
- 团队 A 依赖团队 B 的 API，但团队 A 是平台、团队 B 是业务 → 角色倒挂

### 健康对齐

- 团队边界 = 服务边界 = 代码 ownership
- 团队独立交付一个业务流，不需要跨团队协调
- 平台团队提供自服务接口，不阻塞 stream 团队

### 不对齐信号

- 同一服务多个团队改 → ownership 模糊
- 团队职责与代码模块错位 → 改动跨团队
- 平台团队变成审批者而非服务者

## 7. 评估方法

### 定量

- DORA 四指标按团队拆分（[engineering-productivity-metrics-summary](./engineering-productivity-metrics-summary.md)）
- 跨团队依赖图节点数与边数
- 团队独立交付比例（不需要跨组协调的功能占比）
- 评审等待时长

### 定性

- 团队满意度调查（"你觉得被什么拖慢"）
- PM 反馈（"哪些功能要跨团队协调"）
- 跨团队访谈

### 输出

- 团队拓扑图
- 依赖拓扑图
- 瓶颈清单（按优先级）
- 组织调整建议

## 8. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 只看个人 KPI | 个人很忙团队慢 | 团队级 + 组织级指标 |
| 加人解决 | 加人不加产能 | 先找结构瓶颈 |
| 频繁重组 | 半年一变 | 给团队稳定期 |
| 平台变审批者 | 平台团队变瓶颈 | 自服务化 |
| 没有平台团队 | 每个 stream 团队自建基建 | 投资平台 |

## 9. 落地节奏

- 半年一次组织效能体检
- 季度看依赖拓扑变化
- 每迭代看交付瓶颈
- 重大组织调整前后必做对比

## 10. 关联

- 模板：[org-productivity-diagnosis-template.md](./org-productivity-diagnosis-template.md)
- 相关：[engineering-productivity-metrics-summary.md](./engineering-productivity-metrics-summary.md)、[tech-roadmap-review-summary.md](./tech-roadmap-review-summary.md)
- 参考：Matthew Skelton — *Team Topologies*
