---
title: YiAi 项目开发规范索引
tags: [yiai, specs, index, fastapi, python]
category: projects/yiai/specs
created: 2026-09-02
updated: 2026-09-02
source: internal
type: summary
status: stable
lifecycle: active
roles: [engineer]
benefit: "YiAi 后端项目的 AI 代码生成规范统一入口"
related:
  - ./项目架构摘要.md
---

# YiAi 项目开发规范索引

本文档是 AI 代码生成的规范索引，所有规范文档在此目录下统一管理。

## 架构规范

| 文档 | 说明 |
|------|------|
| [项目架构摘要](./项目架构摘要.md) | 技术栈、目录结构、模块边界、数据流、配置概览 |
| [API 规范](./架构/api规范/规范.md) | RPC 信封协议、路由注册、FastAPI 模式、SSE 流式响应、错误码 |
| [模块结构规范](./架构/模块结构/规范.md) | domain/service/server/data 分层、`__init__.py` 公共 API、命名规范 |
| [数据库规范](./架构/数据库规范/规范.md) | MongoDB 单例、Motor 异步、Repository 模式、集合命名、双写持久化 |
| [认证规范](./架构/认证规范/规范.md) | JWT + bcrypt、X-Token 请求头、认证中间件 |

## 设计模式

| 文档 | 说明 |
|------|------|
| [领域服务模式](./模式/领域服务/规范.md) | domain 模块结构、service 层封装、`__init__.py` 公共 API 导出 |
| [Agent 循环模式](./模式/agent循环/规范.md) | 多轮 LLM Agent、工具调用、确认门控、SSE 事件流 |

## 工作流

| 文档 | 说明 |
|------|------|
| [分支管理](./workflows/分支管理.md) | dev -> test -> release -> master 分支策略 |
| [部署](./workflows/部署.md) | uvicorn 启动、config.yaml 配置、环境搭建 |

## 快速导航

### 按开发场景

| 场景 | 规范文档 |
|------|---------|
| 新增 API 端点 | [API 规范](./架构/api规范/规范.md) |
| 新增 domain 模块 | [模块结构规范](./架构/模块结构/规范.md) + [领域服务模式](./模式/领域服务/规范.md) |
| 数据库操作 | [数据库规范](./架构/数据库规范/规范.md) |
| 添加认证保护 | [认证规范](./架构/认证规范/规范.md) |
| 开发 Agent 功能 | [Agent 循环模式](./模式/agent循环/规范.md) |
| 部署上线 | [部署](./workflows/部署.md) |