---

doc_type: module
prd_task_id: "YP-09-153"
title: "YP-09-153: 哈希计算器 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["160-prd-test-哈希计算器.md"]
source_prd: "160-功能实现-哈希计算器.md"

type: task
---

# YP-09-153: 哈希计算器 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-153 · 状态：方案已编写

## 哈希算法

| 算法 | API |
|------|-----|
| MD5 | crypto-js |
| SHA-1/256/512 | SubtleCrypto.digest |
| 文件哈希 | FileReader + SubtleCrypto |
| HMAC | SubtleCrypto.sign |

---

## 一、需求背景

来源 PRD：160-功能实现-哈希计算器.md

### 用户痛点

1. **文件校验不便**：下载文件后验证 SHA256 校验和
1. **文本哈希需切换工具**：快速生成密码哈希或数据签名
1. **HMAC 计算繁琐**：API 签名需要 HMAC-SHA256

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 算法 | API |
| MD5 | crypto-js |
| SHA-1/256/512 | SubtleCrypto.digest |
| 文件哈希 | FileReader + SubtleCrypto |
| HMAC | SubtleCrypto.sign |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |

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
| 1 | 大型文件哈希计算阻塞 UI | P1 | ### 挑战 | 待实施 |
| 2 | Web Crypto API 不支持 MD5 | P1 | 需要 MD5 哈希 | 待实施 |

