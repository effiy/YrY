---
doc_type: prd
title: "YP-09-S19: 阿里/腾讯/火山翻译集成"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S19
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, 阿里, 腾讯, 火山, 翻译]
category: 项目/桌面应用/需求
---

# YP-09-S19: 阿里/腾讯/火山翻译集成

> 需求编号：YP-09-S19 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 阿里翻译

- AccessKey ID + Secret 认证
- 阿里云机器翻译 API
- 支持电商/社交/视频等垂直领域

## 腾讯翻译

- SecretId + SecretKey 认证
- 腾讯云 TMT API
- 15 语言对

## 火山翻译

- Access Key + Secret Key 认证
- 字节跳动旗下翻译引擎
- 100+ 语言

## 验收标准

- [ ] 阿里翻译中英互译正确
- [ ] 腾讯翻译 API 正常调用
- [ ] 火山翻译多语言可用
- [ ] 签名算法正确

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| 阿里 AccessKey 无效 | 异常 | 提示"阿里云 AccessKey 验证失败" | — |
| 腾讯 Secret 错误 | 异常 | 提示"腾讯云 Secret 验证失败" | — |
| 火山 Access Key 错误 | 异常 | 提示"火山引擎 Access Key 无效" | — |
| API 签名错误 | 异常 | 提示"签名验证失败，请检查签名生成逻辑" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 安全 | API Key 存储 | AES-256 加密 | 磁盘检查 |
| 安全 | API 签名 | 各服务严格按文档签名算法 | 自动化测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | 阿里云翻译 API | HTTPS POST (HMAC-SHA1 签名) | 阿里云 API 格式 |
| 依赖 | 腾讯云 TMT API | HTTPS POST (TC3-HMAC-SHA256 签名) | 腾讯云 API 格式 |
| 依赖 | 火山引擎翻译 API | HTTPS POST (HMAC-SHA256 签名) | 火山引擎 API 格式 |
| 依赖 | 插件配置存储 | Tauri config | AccessKey/SecretKey |
| 被依赖 | 划词翻译核心 | 插件接口 | `translate(text, from, to) → result` |

---

## 相关文档

- 开发方案: [30-prd-task-阿里腾讯火山翻译](../../devs/2026-09/30-prd-task-阿里腾讯火山翻译.md)
- 测试方案: [30-prd-test-阿里腾讯火山翻译](../../tests/2026-09/30-prd-test-阿里腾讯火山翻译.md)
- 翻译服务接口全景: [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md)