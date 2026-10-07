---

doc_type: module
prd_id: "PO-09-66"
title: "PO-09-66: History 页 YiAi 分析刷新按钮 — 手动重新获取云端统计数据"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-66: History 页 YiAi 分析刷新按钮

> 用户体验完善：YiAi 分析数据在页面加载时获取一次，应支持手动刷新以获取最新统计。

## 背景

YiPot History 页的 YiAi 分析数据（翻译量/语种对/缓存条目/反馈率）在页面挂载时通过 `loadYiAiStats()` 获取一次。用户在翻译后想查看更新后的统计，需重新打开页面。

添加刷新按钮后，用户可一键重新获取 YiAi 分析数据，无需刷新页面。

## 范围

**In scope**：
- Stats bar 搜索栏左侧新增刷新图标按钮
- 点击调用 `loadYiAiStats()` 重新获取数据
- 使用已有的 `HiOutlineRefresh` 图标

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P2 | 刷新按钮 | 点击刷新图标重新获取并更新 YiAi 统计数据 |

## 验收标准

- [ ] Stats bar 右侧搜索栏旁显示刷新图标按钮
- [ ] 点击刷新触发 loadYiAiStats()
- [ ] 新数据替换旧数据显示