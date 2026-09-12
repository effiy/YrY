---
title: MoSCoW 优先级排序
tags: [framework, moscow, prioritization, producter]
category: producter/frameworks
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "产品经理使用 MoSCoW 方法对功能进行四分类排期，强制做出明确的范围取舍决策，避免'什么都要做但什么都做不完'"
related:
  - ./README.md
  - ./06-框架-RICE-ICE优先级.md
---

# MoSCoW 优先级排序

> **MoSCoW 通过将每个功能分入四个桶中，强制做出明确的范围决策。** 它是最简单的优先级排序框架——没有数字、没有公式，只有清晰的分类。它的力量不在于"算出"优先级，而在于"对话出"优先级：MoSCoW 是一个对话工具，而非计算工具。

## 四大分类

| 分类 | 含义 | 经验占比 | YrY 示例（YiVad Agent 功能） |
|---|---|---|---|
| **Must have（必须有）** | 没有它，这个版本就是失败的。不可协商。 | ≤ 总工作量的 60% | Agent 能从案例数据中生成报告草稿 |
| **Should have（应该有）** | 重要但非关键。实在不行可以延后。 | 约 20% | 多语言输出（中文 + 英文） |
| **Could have（可以有）** | 锦上添花。有时间就做，没时间就延。 | 约 20% | 报告草稿中标注来源文件引用 |
| **Won't have（不做）** | 明确排除在本版本之外。不是说"也许以后"——是"这版不做"。 | 记录在案 | 多级审批工作流 |

## 使用方法

1. **列出所有候选功能** — 任何人提过的任何想法都放上来
2. **先圈 Must have** — 问自己：哪些功能的缺失会导致本版本无法发布？
3. **执行 60% 规则** — 如果 Must have 估算工作量超过总量的 60%，说明你圈了太多。挑其中一部分降级为 Should have
4. **明确 Won't have** — 任何不在 Must/Should/Could 里的，都属于 Won't have。不要留空——Won't have 列表越明确，需求蔓延越少
5. **与干系人对齐** — MoSCoW 是对话工具，不是独自做完就通知。与工程和业务干系人一起评审分类，确保技术可行性和业务优先级一致

## Must have 判定测试

每当你标记一个功能为 Must have，问自己：

> "如果这个版本发布时不包含这个功能，我们会不会选择推迟发布？"

- **"会推迟"** → Must have（这个功能确实是版本的基石）
- **"不会推迟，但会很遗憾"** → Should have（重要但不致命）
- **"不会推迟，下次做也行"** → Could have

## MoSCoW 与 RICE 的配合使用

MoSCoW 给你四个桶，但它不告诉你同一个桶里先做哪个。这就是 RICE 的用武之地：

```
第一步（MoSCoW）：将所有功能分为 M / S / C / W 四个桶
第二步（RICE）：在每个桶内用 RICE 评分排序
```

**示例（YiVad Agent 功能的优先级排序）**：

| 桶 | 功能 | RICE 评分 | 排序 |
|---|---|---|---|
| Must | 报告草稿生成 | 600 | 1 |
| Must | 案例数据解析 | 450 | 2 |
| Must | 标准格式输出 | 320 | 3 |
| Should | 多语言输出 | 200 | 4 |
| Should | 在线编辑草稿 | 180 | 5 |
| Could | 来源引用标注 | 90 | 6 |
| Could | 导出为 Word | 75 | 7 |

## 在 YrY 中的实践

### 单项目版本规划（YiVad 示例）

YiVad 的某个版本要上线 Agent 功能。使用 MoSCoW 做范围控制：

| 分类 | 功能 |
|---|---|
| **Must** | Agent 对话界面、报告草稿生成、草稿提交保存 |
| **Should** | 报告中文/英文切换、草稿编辑功能 |
| **Could** | 报告导出 PDF/Word、报告模板选择 |
| **Won't** | 审批流程、外部系统对接、自定义品牌样式 |

### 跨项目版本规划

当 YiPet 和 YiAi 需要协作时，MoSCoW 帮助双方对齐优先级：

| 分类 | YiPet | YiAi |
|---|---|---|
| **Must** | 知识树浏览 + 范围选择 UI | RAG 混合检索 API |
| **Should** | 来源引用预览 | 检索结果高亮标记 |
| **Could** | 多文件同时选择 | 检索缓存优化 |
| **Won't** | 离线知识缓存 | 多模型检索 A/B 测试 |

## 实践建议

1. **用故事点而非功能数量来算占比**："Must have 有 3 个功能"不等于"工作量 30%"。一个 Must have 可能需要 13 个故事点，而 3 个 Could have 各需要 1 个点。始终用工时/故事点来计算 60% 规则
2. **Won't have 写得和 Must have 一样详细**：明确的 Won't have 列表管理干系人预期。评审时有人说"能不能也加上 X"，你可以指着 Won't have 列表说"X 已经明确在这个版本不做了"
3. **工程师参与 Must have 工作量评估**：PM 标记一个功能为 Must have，但如果工程师评估它需要 8 周而整个版本只有 4 周，那它就不是 Must have——因为不可能完成。Must have 的判断必须结合工程可行性
4. **版本范围锁定后不再加 Must**：版本规划一旦确定，只降不升（功能只能从 Must 往 Should/Could 降，不能反向）。中途新需求进 Won't have 列表，下个版本再评估

## 反模式

- **所有东西都是 Must have。** 如果每个功能都"必须"，那就没有一个真的必须。严格执行 60% 规则：如果 Must have 超过 60%，就削减。这是 MoSCoW 最重要也最难遵守的规则
- **Won't have 是空的。** 一个空的 Won't have 列表示你没有做真正的取舍。每个版本都有不做的东西——Won't have 列应该是最长的列之一
- **只用 MoSCoW 做排序。** MoSCoW 给你四个桶，不给桶内顺序。在 Must have 桶中，你仍然需要知道先做哪个。配合 RICE/ICE 使用
- **干系人定义 Must have 而不咨询工程团队。** 一个功能如果需要 80% 的版本预算，那它不能是 Must have——除非它是唯一的功能。工作量评估限制着 Must have 桶的大小
- **MoSCoW 做完了但团队不知道。** 如果你在会议室里做好分类但没和开发团队同步，那等于没做。MoSCoW 的结果必须在 Sprint 规划时与团队共享和确认