---
doc_type: test
title: "YiPot 服务层修复（第七轮）— 测试方案"
tags: [测试方案, 服务层, null-safety, google, baidu]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-116
prd_ref: YP-09-70
dev_ref: YP-09-111
roles: [engineer]
---

# YiPot 服务层修复（第七轮）— 测试方案

> 测试编号：YP-09-116 · 关联 PRD：YP-09-70 · 关联开发：YP-09-111

---

## 一、测试用例

### TC-01: Google 翻译正常响应

| 项 | 内容 |
|-----|------|
| **步骤** | 翻译 "hello" → 英语→中文 → Google 引擎 |
| **预期** | 正常返回翻译结果 "你好" |

### TC-02: Google 翻译空响应

| 项 | 内容 |
|-----|------|
| **步骤** | Mock Google API 返回 `[[], null, null]` |
| **预期** | 抛出 "Unexpected Google API response format"，不出现 TypeError |

### TC-03: Baidu 翻译配置为空

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 appid/secret，直接测试 Baidu 翻译 |
| **预期** | 显示 "Please configure appid and secret"，不出现 TypeError |

### TC-04: Baidu 翻译正常

| 项 | 内容 |
|-----|------|
| **步骤** | 配置有效 appid/secret → 翻译 |
| **预期** | 正常返回翻译结果 |

### TC-05: Updater 监听器清理

| 项 | 内容 |
|-----|------|
| **步骤** | 1. 检查更新 → 关闭更新窗口 → 再打开 |
| **预期** | 下载进度监听器不累积，eventId 正确重置 |

---

## 二、回归测试

- 划词翻译 → Google/Baidu 引擎正常
- 检查更新 → 窗口正常弹出

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/70-prd-服务层修复第七轮.md` |
| 开发方案 | `../devs/2026-09/111-prd-task-服务层修复第七轮.md` |