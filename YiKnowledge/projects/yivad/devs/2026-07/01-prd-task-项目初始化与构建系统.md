---
doc_type: module
prd_task_id: "YV-07-01"
title: "YV-07-01: 项目初始化与构建系统 — Vue 3.5 + TypeScript strict + Rsbuild — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
estimate_frontend: 5.0
source_prd: "01-prd-项目初始化与构建系统.md"
---

# YV-07-01: 项目初始化与构建系统 — Vue 3.5 + TypeScript strict + Rsbuild — 开发任务

> 来源 PRD：[01-prd-项目初始化与构建系统.md](../prds/2026-07/01-prd-项目初始化与构建系统.md)
> 需求编号：YV-07-01 · 优先级：P0 · 人天：5.0d

## 三、实施步骤

### 3.1 分步执行

```mermaid
flowchart TD
  S1["步骤 1: Vue 3.5 + Rsbuild 项目初始化<br/>1.0d | 产出: package.json/rsbuild.config.ts/tsconfig.json<br/>验证: pnpm dev 启动，首页渲染"]
  S2["步骤 2: TypeScript strict 配置<br/>1.0d | 产出: tsconfig.json strict:true<br/>验证: vue-tsc --noEmit 通过"]
  S3["步骤 3: 目录结构搭建<br/>1.0d | 产出: api/stores/components/views/layouts<br/>验证: 模块边界清晰，符合 CLAUDE.md 规范"]
  S4["步骤 4: RequestHttp RPC 封装<br/>1.0d | 产出: RequestHttp.ts + rpcCall<T>()<br/>验证: RPC 信封正确解析，401 自动重定向"]
  S5["步骤 5: Element Plus + Pinia 集成<br/>1.0d | 产出: main.ts 注册 + 首个 Pinia store<br/>验证: 组件渲染正常，状态管理可用"]

  S1 --> S2 --> S3 --> S4 --> S5

  style S1 fill:#d4edda,stroke:#28a745
  style S2 fill:#d4edda,stroke:#28a745
  style S3 fill:#d4edda,stroke:#28a745
  style S4 fill:#fff3cd,stroke:#ffc107
  style S5 fill:#d4edda,stroke:#28a745
```

### 3.2 验证检查点

| 步骤 | 验证项 | 通过标准 |
|------|--------|----------|
| 步骤 1 | 开发服务器 | `pnpm dev` 在 30s 内启动，`http://localhost:8848` 可访问 |
| 步骤 2 | 类型检查 | `vue-tsc --noEmit` 退出码 0，无类型错误 |
| 步骤 3 | 目录结构 | `src/api/`、`src/stores/`、`src/components/`、`src/views/` 均存在 |
| 步骤 4 | RPC 通信 | `rpcCall("services.data_service", "query_documents", {cname:"menus"})` 返回正确数据 |
| 步骤 5 | 组件渲染 | Element Plus 组件渲染正常，Pinia store 读写正常 |

---
