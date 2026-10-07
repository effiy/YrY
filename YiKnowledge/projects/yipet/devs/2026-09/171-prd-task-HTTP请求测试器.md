---

doc_type: module
prd_task_id: "YP-09-165"
title: "YP-09-165: HTTP 请求测试器 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["171-prd-test-HTTP请求测试器.md"]
source_prd: "171-功能实现-HTTP请求测试器.md"

type: task
---

# YP-09-165: HTTP 请求测试器 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-165 · 状态：方案已编写

## API 测试

| 功能 | 说明 |
|------|------|
| 方法 | GET/POST/PUT/DELETE |
| Headers | 自定义请求头 |
| Body | JSON/Form/Text |
| 响应 | 状态码/Body/Headers/耗时 |

---

## 一、需求背景

来源 PRD：171-功能实现-HTTP请求测试器.md

### 用户痛点

1. **接口调试效率低**：每次测试 API 需要写 fetch 代码或切换工具
1. **内网接口测试困难**：Postman 无法访问 localhost 或内网服务
1. **请求重放不便**：修改一个请求头后重新发送

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 方法 | GET/POST/PUT/DELETE |
| Headers | 自定义请求头 |
| Body | JSON/Form/Text |
| 响应 | 状态码/Body/Headers/耗时 |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |
| 3 | 边界场景处理 + 集成验证 |

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
| 1 | JSON 响应需要手动格式化 | P1 | ### 挑战 | 待实施 |
| 2 | curl 命令生成 | P1 | 需要正确处理引号转义、多行请求体、文件上传等边界情况 | 待实施 |

