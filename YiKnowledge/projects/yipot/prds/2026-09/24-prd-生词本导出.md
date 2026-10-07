---
doc_type: prd
title: "YP-09-S13: Anki/欧路生词本导出"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S13
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 生词本, Anki, 欧路词典]
category: 项目/桌面应用/需求
---

# YP-09-S13: Anki/欧路生词本导出

> 需求编号：YP-09-S13 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 背景

语言学习者需要将翻译过的词汇保存到生词本中复习。Anki 是开源间隔重复记忆软件，欧路词典是国内流行的词典 App。

## 需求

### Anki 导出

- 通过 AnkiConnect 插件通信（`http://127.0.0.1:8765`）
- 支持自定义牌组/笔记类型
- 字段映射：word → 正面、translation → 背面

### 欧路词典导出

- HTTP API 添加生词
- 支持自定义词典

## 验收标准

- [ ] Anki 卡片创建成功
- [ ] 欧路生词添加成功
- [ ] 字段映射配置生效
- [ ] 导出失败时友好提示

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| Anki 未启动 | 异常 | 提示"请先启动 Anki 并安装 AnkiConnect (代码 2050737842)" | 引导安装 AnkiConnect |
| AnkiConnect 版本过低 | 异常 | 提示"AnkiConnect 版本过低，请更新" | — |
| 欧路词典未安装 | 异常 | 提示"未检测到欧路词典，请先安装" | — |
| 导出字段映射错误 | 异常 | 显示具体映射失败字段 | 默认映射作为 fallback |
| 导出列表为空 | 边界 | 提示"收藏列表为空" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | Anki 卡片创建 | ≤ 500ms/条 | 计时测试 |
| 性能 | 批量导出 100 条 | ≤ 30s | 计时测试 |
| 可用性 | AnkiConnect 通信 | HTTP 127.0.0.1:8765 | 端口检测 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | AnkiConnect | HTTP JSON-RPC (127.0.0.1:8765) | `{action, params}` |
| 依赖 | 欧路词典 | HTTP API | `{word, translation}` |
| 依赖 | 本地收藏列表 | store.js | `[{word, translation, date}]` |
| 被依赖 | 翻译窗口 | 收藏按钮 | `addToCollection(word, translation)` |

---

## 相关文档

- 开发方案: [24-prd-task-生词本导出](../../devs/2026-09/24-prd-task-生词本导出.md)
- 测试方案: [24-prd-test-生词本导出](../../tests/2026-09/24-prd-test-生词本导出.md)
- 语音合成与生词本: [03-prd-语音合成与生词本](./03-prd-语音合成与生词本.md)