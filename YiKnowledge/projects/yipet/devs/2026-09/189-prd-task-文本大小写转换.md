---

doc_type: module
prd_task_id: "YP-09-182"
title: "YP-09-182: 文本大小写转换 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["189-prd-test-文本大小写转换.md"]
source_prd: "189-功能实现-文本大小写转换.md"

type: task
---

# YP-09-182: 文本大小写转换 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-182 · 状态：方案已编写

## 大小写

| 转换 | 示例 |
|------|------|
| 全大写 | HELLO WORLD |
| 全小写 | hello world |
| 首字母大写 | Hello World |
| 驼峰 | helloWorld |
| 下划线 | hello_world |

---

## 一、需求背景

来源 PRD：189-功能实现-文本大小写转换.md

### 用户痛点

1. **命名转换低效**：从 Python 接口定义生成前端 TypeScript 类型时转换字段名
1. **标题格式化出错**：撰写文档标题时忘记 Title Case 规则
1. **源码格式未知**：粘贴标识符但不知道当前格式

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 转换 | 示例 |
| 全大写 | HELLO WORLD |
| 全小写 | hello world |
| 首字母大写 | Hello World |
| 驼峰 | helloWorld |
| 下划线 | hello_world |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |

## 三、关键技术决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | 纯前端浏览器 API 实现 | 无需服务端依赖，响应 < 50ms，离线可用 |
| 2 | 独立 Vue 3 Composable 封装 | 单一职责，可复用于 Popup + Side Panel |

## 四、实施步骤

| 步骤 | 任务 | 预估 |
|------|------|------|
| 1 | Composable 核心逻辑 + 状态管理 | 0.1d |
| 2 | Vue 3 UI 组件开发（含错误/空/加载状态） | 0.1d |
| 3 | 边界场景处理 + 集成测试 | 0.1d |

**总计：0.3d**

## 五、完成记录

> **状态**：方案已编写 · **日期**：2026-09-23 · 实施排期待定

## 六、技术债与缺口

| # | 项目 | 优先级 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | 需要 sPoNgEbOb CaSe 文本时手动逐个切换 | P1 | ### 挑战 | 待实施 |
| 2 | 连续大写边界检测 | P1 | `XMLParser` 是 `XML` + `Parser`（两个词）还是 `X`+`M`+`L`+`P`+...？需智能检测 | 待实施 |

