---
title: Nielsen 10 启发式评估
tags: [UX, 可用性, 评估]
category: product/ux
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Nielsen 10 启发式评估

## 1. 框架定义

Jakob Nielsen（1994）提出，10 条通用的可用性启发式，用于评估界面可用性。是业界使用最广的可用性检查清单。

## 2. 10 条启发式

| 编号 | 启发式 | 含义 |
|---|---|---|
| 1 | Visibility of system status 系统状态可见 | 用户随时知道系统在做什么 |
| 2 | Match between system and real world 与现实世界匹配 | 用语言与概念贴近用户，不技术化 |
| 3 | User control and freedom 用户控制与自由 | 提供"紧急出口"（撤销、退出） |
| 4 | Consistency and standards 一致性与标准 | 同一概念用同一词，遵循平台约定 |
| 5 | Error prevention 错误预防 | 防错优于报错 |
| 6 | Recognition rather than recall 识别而非回忆 | 选项可见，不靠记忆 |
| 7 | Flexibility and efficiency of use 灵活与高效 | 快捷键、可定制 |
| 8 | Aesthetic and minimalist design 美学与极简 | 不堆无关信息 |
| 9 | Help users recognize, diagnose, recover from errors 帮助识别与恢复错误 | 错误信息人话 + 解决建议 |
| 10 | Help and documentation 帮助与文档 | 必要时提供可查的文档 |

## 3. 评估流程

1. **准备**：选 2-3 名评估者（独立评估），熟悉产品
2. **走查**：每人独立按典型任务走，发现违反启发式的问题
3. **记录**：每个问题写：违反哪条启发式、严重度（1-5）、位置截图
4. **合并**：合并重复，按严重度排序
5. **修复**：top 严重度优先
6. **复审**：修复后再走查

## 4. 严重度分级

| 级 | 含义 |
|---|---|
| 5 | 阻塞核心任务，必须立刻修 |
| 4 | 影响多数用户，本迭代修 |
| 3 | 影响部分用户，下迭代修 |
| 2 | 小问题，可延后 |
| 1 | 表面问题，可选 |

## 5. 与其他评估方法对比

| 方法 | 适合 |
|---|---|
| 启发式评估 | 设计初期快速找问题，2-3 人 1-2 天 |
| 可用性测试 | 5 个真实用户走查，发现真实障碍 |
| A/B 测试 | 上线后量化对比 |
| 数据分析 | 已上线功能持续监控 |

启发式评估不能替代可用性测试，但成本极低，可定期做。

## 6. AI 产品的特殊关注点

| 启发式 | AI 场景特别关注 |
|---|---|
| 系统状态可见 | 流式输出、思考链、工具调用展示 |
| 用户控制与自由 | 可中断、可重生成、可编辑 |
| 错误预防 | 敏感操作人在回路 |
| 一致性 | 多模态回答风格一致 |
| 帮助识别错误 | 模型出错时给出可操作建议（不是技术报错） |
| 帮助文档 | 模型能力与限制说明 |

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 评估者只 1 人 | 视角单一 | 至少 2 人 |
| 不走任务 | 列问题浮于表面 | 按典型任务走 |
| 严重度全 5 | 没有优先级 | 严格 1-5 分档 |
| 不修复 | 评估报告放着 | 修 + 复审 |

## 8. 本团队落地案例

- 每季度一次启发式评估，2-3 名设计师 + PM
- 上线新功能后必走查
- AI 特殊关注点纳入：流式输出、思考链、可重生成

## 9. 参考资料

- Nielsen Norman Group — *10 Usability Heuristics for User Interface Design*
- https://www.nngroup.com/articles/ten-usability-heuristics
