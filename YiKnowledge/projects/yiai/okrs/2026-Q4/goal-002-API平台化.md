---
type: okr-goal
id: yiai-q4-002
title: "API 平台化与开发者体验"
status: planned
period: "2026 Q4"
owner: ""
project: YiAi
project_id: yiai
progress: 15
updated: 2026-09-14
kr1: "OpenAPI 文档自动生成 — 从路由/Model 自动生成 OpenAPI 3.1 spec + Swagger UI"
kr1_completion: 10
kr2: "API 版本化策略 — `/v1/` `/v2/` 路由前缀 + 灰度发布 + 废弃策略"
kr2_completion: 5
kr3: "智能限流 — 双重令牌桶嵌套配额（用户级 + 端点级）+ 自适应速率限制"
kr3_completion: 20
kr4: "SDK 自动生成 — TypeScript SDK（YiVad/YiPet 用）+ Python SDK（外部用）"
kr4_completion: 0
kr5: "API 调试控制台 — YiVad 内置 API Console，支持请求构造/响应查看/Token 管理"
kr5_completion: 0
metric1_id: "yiai-q4-m04"
metric1_desc: "API 端点文档覆盖率"
metric1_current: "40%"
metric1_target: "100%"
metric2_id: "yiai-q4-m05"
metric2_desc: "SDK 覆盖的 API 端点比例"
metric2_current: "0%"
metric2_target: "90%"
metric3_id: "yiai-q4-m06"
metric3_desc: "限流误拦率"
metric3_current: "5%"
metric3_target: "<1%"
related_prds:
  - projects/yiai/prds/2026-09/16-需求-API限流与并发控制.md
  - projects/yiai/prds/2026-09/30-需求-API网关.md
  - projects/yiai/prds/2026-09/34-需求-API版本管理.md
  - projects/yiai/prds/2026-09/56-需求-中间件管道编排.md
  - projects/yiai/prds/2026-09/72-需求-响应格式协商.md
  - projects/yiai/prds/2026-09/130-需求-双重令牌桶嵌套配额.md
  - projects/yiai/prds/2026-09/140-需求-API文档自动生成.md
  - projects/yiai/prds/2026-09/153-需求-API版本化策略.md
  - projects/yiai/prds/2026-09/204-需求-API速率限制策略.md
---

# API 平台化与开发者体验

> Q4 平台化目标。将 YiAi 从"内部后端服务"升级为"API 平台"——自动生成文档、标准化版本管理、智能限流、多语言 SDK，使外部开发者和内部前端团队都能高效接入。

## 背景

YiAi 的 18 个路由模块目前缺乏统一的 API 文档和版本管理。前端团队依赖源码阅读确认接口参数，新接入方学习成本高。Q4 围绕 OpenAPI 标准建立完整的 API 平台能力。

## 关键结果

1. **OpenAPI 文档** — 从 FastAPI 路由和 Pydantic Model 自动生成 OpenAPI 3.1 规范，提供 Swagger UI（`/docs`）和 ReDoc（`/redoc`），覆盖 100% 端点。
2. **API 版本化** — `/v1/` `/v2/` 路由前缀，支持灰度发布（10%→50%→100%）和废弃策略（sunset header + 3 个月过渡期）。
3. **智能限流** — 双重令牌桶：用户级（全局 QPS）+ 端点级（精细粒度），自适应速率限制根据服务负载动态调整，误拦率 <1%。
4. **SDK 生成** — TypeScript SDK（供 YiVad/YiPet 使用，替代手写 `api/modules/*`）和 Python SDK（供外部调用方使用），从 OpenAPI spec 自动生成。
5. **API 调试控制台** — YiVad 内置 API Console，支持请求构造、响应查看、Token 管理、历史记录。

## 影响

- 新开发者接入时间从 3 天降至 0.5 天
- API 变更破坏性降低 90%（版本化 + 灰度）
- YiVad/YiPet API 层从手写 37 个模块 → SDK 自动生成
- 外部集成方可通过标准 OpenAPI 对接