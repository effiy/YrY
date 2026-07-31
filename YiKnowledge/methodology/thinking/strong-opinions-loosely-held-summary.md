---
title: Strong Opinions, Loosely Held
tags: [思维模型, 决策, 协作]
category: methodology/thinking
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Strong Opinions, Loosely Held

## 1. 模型定义

Paul Saffo 提出（VC 与 forecaster），被 Marc Andreessen 与 Ben Horowitz 推广。核心命题：

> **以强观点开始，但以开放心态对待反证。**

不是"我也不知道"的怯懦，也不是"我就这么认为"的固执，而是：
- 当前判断要有明确的逻辑与证据，不能模糊
- 反证出现时，及时改变判断
- 改变判断不应感到羞耻，而是基于更好信息更新

## 2. 适用场景

- 不确定性高的决策（新产品方向、技术选型）
- 信息持续演化（市场变化、模型迭代）
- 跨团队对齐（避免无主见也避免僵化）
- 个人成长（避免被过去判断困住）

## 3. 使用步骤

1. **形成明确观点**：用证据与逻辑支持一个判断
   - 例："BRD 多语言生成应该用同一 prompt + 多语言术语表，而不是分语言单独 prompt"
2. **明确假设与证据**：我基于什么假设？什么证据会推翻？
3. **公开表达**：让团队知道你的判断与理由
4. **主动找反证**：跟踪可能推翻判断的信号
5. **反证出现时及时更新**：明确说"我之前判断基于 X，新数据是 Y，新判断是 Z"
6. **不因改判断而尴尬**：更新是基于新信息的能力，不是反复无常

## 4. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 强观点强持有 | 固执，不接受反证 | 列出会改变判断的信号 |
| 弱观点弱持有 | 没主见，跟大流 | 强制写"我的判断是..." |
| 强观点但没证据 | 是直觉不是观点 | 列出证据与假设 |
| 改判断不公开 | 暗中转方向，团队跟不上 | 公开更新与理由 |
| 频繁改判断 | 反复无常，没有判断 | 限定更新频率（周 / 月） |

## 5. 区别相关概念

| 概念 | 含义 | 区别 |
|---|---|---|
| Strong opinions, loosely held | 强观点 + 松持有 | 决策模式 |
| Strong opinions, weakly held | 弱观点 + 弱持有 | = 没观点 |
| Weak opinions, strongly held | 弱观点 + 强持有 | = 固执（最坏组合） |
| Strong opinions, strongly held | 强观点 + 强持有 | = 难转向，创业期可，成长期危险 |

## 6. 在团队中实践

- **决策记录**：每个决策写 ADR，含背景、假设、决定、可证伪信号
- **可证伪**：明确"什么数据出现就翻案"
- **回顾复盘**：季度看历史判断准确率，校准自信度
- **鼓励反对**：欢迎团队挑战主流判断，但要给证据

## 7. 案例

### 技术选型

- 当前判断："用 vLLM 部署 LLM，因生态成熟、易用"
- 假设：社区活跃、稳定版本迭代快、内部维护门槛低
- 可证伪：若 vLLM 多次出现稳定性回归 / 替代品（SGLang）展示显著优势
- 跟踪信号：版本 release notes、SLA 监控、内部团队反馈
- 半年后若 SGLang 显示优势 → 更新判断

### 团队管理

- 当前判断："前端选 React 18 + Ant Design 5，因生态成熟"
- 假设：Antd 5 长期维护、React 18 兼容性稳
- 可证伪：若 Vue 3 + Element Plus 在我们场景展示显著优势

## 8. 与 ADR 关联

ADR (Architecture Decision Records) 是这一模式的落地形式：

- 当前决定（strong opinion）
- 决定基于的假设与约束
- 什么变化会推翻决定（loosely held）
- 复审时间点

## 9. 参考资料

- Paul Saffo — *Six Rules for Effective Forecasting*（HBR, 2007）
- Marc Andreessen — *The Pmarca Guide to Startups*
- Ben Horowitz — *The Hard Thing About Hard Things*
