---
title: 产品发现（Discovery）框架
tags: [PM, 框架, 产品发现, Discovery]
category: methodology/pm-frameworks
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 产品发现（Discovery）框架

## 1. 框架来源

Teresa Torres（*Continuous Discovery Habits*）与 Marty Cagan（*Inspired / Empowered*）推广。核心命题：**产品上线前的"发现"比"交付"更重要——避免把团队数月的时间花在没人要的产品上**。

## 2. 核心概念

### 双钻石模型

```
发散（Discover） → 收敛（Define） → 发散（Develop） → 收敛（Deliver）
```

Discovery 阶段做前两个钻石：探索问题空间、定义值得解决的问题。

### 四大风险（Cagan）

每个候选机会评估四类风险：

1. **Value 价值风险**：用户会要吗？业务会受益吗？
2. **Usability 可用性风险**：用户能搞清楚怎么用吗？
3. **Feasibility 可行性风险**：我们能做出来吗？
4. **Viability 可行性风险**：符合合规 / 商业模式 / 品牌吗？

Discovery 的目标是**把这四类风险降到可接受水平**，再进 Delivery。

## 3. 关键实践

### 机会访谈（Opportunity Solution Tree）

```
机会（outcome） → 解决方案（feature） → 实验（test） → 结果（learning）
```

- 顶层：业务结果（如"提升首次成功率到 80%"）
- 中层：用户痛点 / 机会（来自访谈）
- 下层：候选解决方案
- 叶子：每个方案的实验（原型 / AB / 可用性测试）

### 每周用户访谈

- PM + 设计 + 工程师轮换参与
- 每周至少 1-2 次真实用户访谈
- 永不停：上线了也访谈

### 原型测试

- 低保真：纸面 / Figma 线框
- 中保真：可点击原型
- 高保真：可交互、有真实数据
- 工程师可写 spike 验证技术可行性

### 一次性测试（One-Piece-at-a-Time）

- 每周测一个假设，而非积累月度大测试
- 快速失败、快速学习
- 不必每个都上线 AB

## 4. 实施步骤

1. **机会陈述**：写下本季度最重要的业务结果
2. **机会收集**：用户访谈找 5-15 个机会点
3. **机会树构建**：把机会组织成树，分层
4. **每周假设**：本周要验证的假设（来自机会树）
5. **原型 + 实验**：每周一个测试
6. **学习沉淀**：把每周学习写进机会树
7. **进入 Delivery**：当四风险降到可接受，才开 Delivery

## 5. 输入 / 输出工件

- 输入：用户访谈、数据洞察、业务目标
- 输出：机会解决树、每周假设清单、原型、用户测试报告、机会评估文档

## 6. 适用场景与边界

**适用**：

- 探索期产品 / 新业务方向
- 产品方向有真实不确定性
- 团队有 PM + 设计 + 工程独立职能

**不适用**：

- 合同型 B2B（需求合同已定）
- 内部工具改进（用户就是自己）
- 强执行型团队（无探索空间）

## 7. 与其他框架对比

| 框架 | 重点 | 与 Discovery 关系 |
|---|---|---|
| Dual-Track Agile | Discovery 与 Delivery 并行 | Discovery 是其中一条轨 |
| Lean Startup | 假设驱动 + MVP | Discovery 借鉴其方法 |
| Design Thinking | 共情 + 创意 | Discovery 的访谈 / 创意工具 |
| JTBD | 用户要完成什么 | Discovery 的机会识别方法 |

Discovery 是综合性的发现方法学，可整合以上各方法。

## 8. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 把 Discovery 做成阶段 | 完了就进 Delivery 不回来 | Discovery 持续进行 |
| 只 PM 做 Discovery | 工程师不知道为何做这个 | 跨职能参与 |
| 不访谈真用户 | 只问内部销售 / 客服 | 必须接触真实用户 |
| 原型只测 UI | 不测价值假设 | 先测价值，再测可用性 |
| 一次定方向 | 不持续学习 | 每周假设 + 持续学习 |
| 不写机会树 | 学习丢失 | 强制画树 + 沉淀 |
| 学习不进 Delivery | 知道什么不做 | 把 Discovery 结论写进 PRD |

## 9. 机会解决树示例

```
业务结果：BRD 用户首次接受率从 30% 提到 50%
├ 机会 1：用户不知道有这些章节可选
│ ├ 解决方案 1.1：章节模板预览
│ │ └ 实验：原型 + 5 人访谈 → 用户更喜欢
│ └ 解决方案 1.2：推荐章节按钮
│   └ 实验：AB 测试，接受率 +8%
├ 机会 2：术语不一致导致用户改动多
│ ├ 解决方案 2.1：术语表可视化
│ └ 解决方案 2.2：实时术语提示
└ 机会 3：用户不知道哪里改
  └ 解决方案 3.1：diff 视图
```

## 10. 本团队落地案例

- YiAi BRD 团队引入 Discovery 节奏：每周 1-2 次用户访谈 + 每周假设测试
- 机会树工具：Miro / Notion 共同维护
- 与 Dual-Track Agile 配合，发现轨为交付轨持续供弹

## 11. 参考资料

- Teresa Torres — *Continuous Discovery Habits*（2021）
- Marty Cagan — *Inspired* / *Empowered*
- leanstartup.co — *The Lean Startup*
