# 失败案例 / Failures

收录失败的产品发布、技术落地、流程事故案例与教训。

## 收录范围

- 产品发布失败案例
- 技术落地事故（宕机、数据泄露、性能回退）
- 流程事故（评审缺失、回滚失败）
- 复盘报告与改进措施

## 文件类型与命名

- `{事件名}-failure-summary.md`：失败案例摘要
- `{事件名}-postmortem.md`：复盘报告（无指责式）
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某失败案例
tags: [失败案例, 主题]
category: lessons/failures
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: summary
status: stable
---
```

## 写作推荐结构

1. 事件概况（时间、影响范围、严重度）
2. 经过时间线
3. 根因分析（5 Why、鱼骨图）
4. 教训提炼
5. 改进措施与责任人
6. 后续追踪与验证

## 已收录

- `ai-product-launch-lessons-summary.md` — AI 产品发布失败案例与教训
- `incident-postmortem-template.md` — 事件复盘模板（无指责式，含 Severity / Impact scope / Root cause chain / Action items）
- `incident-postmortem-summary.md` — 事件复盘摘要（无指责文化 + 5-Why + Action 跟踪）
- `bugs/` — 单点 bug 复盘集（按 `bug_YYYY_MM_DD_xxx.md` 命名）

## 待收录

- 红队测试不足导致的发布事故
- 幻觉事故复盘
- 数据流断链事故
- 跨时区协作失败的发布事故
- 评审缺失导致的回滚案例
