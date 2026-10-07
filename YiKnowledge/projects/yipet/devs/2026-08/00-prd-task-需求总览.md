---

doc_type: module
prd_task_id: "YP-08-00"
title: "YP-08-00: YiPet 八月需求总览 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
source_prd: "00-需求-需求总览.md"
source_okr: [yipet-002, yipet-004]
estimate_frontend: 20.0

type: task
---

# YP-08-00: 八月迭代总览 — 开发方案

> 需求编号：YP-08-00 · 优先级：P0 · 人天：20.0d

---

## 一、八月迭代主题

**从"可用"到"好用"** — RAG 知识库集成 + 跨项目桥接 + 安全合规 + 皮肤中心重构 + API 服务扩展 + IPC 增强。

### 1.1 背景

七月完成 Vue 3.5 + MV3 基础架构。八月在基础聊天框架上实现 7 大功能模块，使 YiPet 从基础工具升级为知识驱动、跨项目协作的 AI 助手。

### 1.2 核心决策

| 决策 | 选择 | 理由 |
|------|------|------|
| RAG 后端 | YiAi `rag_service` + `knowledge_service` | 复用现有基础设施，无需新建 |
| 跨项目会话传递 | `window.open` + bridgeToken | 简单可靠，单次使用防重放 |
| 皮肤中心架构 | Vue 3 组件化 (Popup 内) | 与 Chat Window 技术栈一致 |
| Markdown 渲染安全 | marked + DOMPurify 双层管道 | 防御 XSS 同时保留富文本 |

### 1.2 交付模块

| # | 模块 | 需求编号 | 核心交付 | 人天 |
|---|------|---------|---------|------|
| 1 | 提示词历史与分支管理 | YP-08-01 | ArrowUp/Down 导航、会话分支、消息编辑/删除/重生成、Markdown 导出 | 4.0 |
| 2 | 知识库与 RAG 集成 | YP-08-02 | 知识树浏览、RAG 检索、scope 限定、子问题分解、@mention | 6.0 |
| 3 | 安全合规 | YP-08-03 | CSP 配置、Token 加密、XSS 防护、IPC_SECRET | 3.0 |
| 4 | 跨项目桥接 | YP-08-04 | YiVad 桥接、Bug 报告双写、页面感知、文本选中集成 | 2.0 |
| 5 | UI 与皮肤中心 | YP-08-05 | Popup 重构、6 色板、角色选择器、皮肤环、页面主题 | 4.0 |
| 6 | API 服务扩展 | YP-08-07 | KnowledgeService、RagService、BugService、SessionService 扩展 | 3.0 |
| 7 | IPC 通信架构 | YP-08-08 | 类型安全消息、超时重试、心跳保活、消息队列 | 1.0 |

---

## 二、架构关系

```
七月基础 → 八月增强
─────────────────────────────────────────────
4-Tier API (4 Service)   → 8 Service (Knowledge/RAG/Bug/...)
基础聊天                   → 完整聊天 (分支/导出/摘要/@mention)
无知识库                   → RAG 知识驱动对话
无跨项目                   → YiPet↔YiVad 双向桥接
简单 Popup                 → 皮肤中心 (实时预览)
无 CSP                     → CSP + Privacy Manifest
基础 IPC                   → 类型安全 + 重试 + 心跳
```

---

## 三、技术风险

| # | 风险 | 缓解 |
|---|------|------|
| R1 | Chat Store 膨胀至 3000+ 行 | 九月拆分 Store + composables |
| R2 | RAG 后端不稳定 | 降级为普通聊天模式 |
| R3 | bridgeToken 过期 | 5min 自动失效，需重新生成 |
| R4 | CWS CSP 审核拒绝 | 参考官方指南逐项检查 |

## 四、里程碑

| 里程碑 | 交付物 | 验证 |
|--------|--------|------|
| M1 — API 扩展 (3d) | 5 个新 Service | 各 Service 单元测试通过 |
| M2 — 聊天核心 (4d) | 分支/导出/摘要/@mention | 手动回归 8 项聊天功能 |
| M3 — RAG + 桥接 (5d) | 知识树 + RAG 聊天 + Bug 双写 | RAG 检索结果正确 |
| M4 — 皮肤 + 安全 (5d) | Popup 重构 + CSP 合规 | 皮肤切换即时生效 |

## 五、完成定义

- [ ] 7 个模块按 §1.2 交付清单全部完成
- [ ] 对标 YiVad aiChat 80%+ 功能覆盖率
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过
- [ ] `npm run build` CSP 零违规