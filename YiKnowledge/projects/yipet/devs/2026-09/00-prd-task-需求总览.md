---

doc_type: module
prd_task_id: "YP-09-00"
title: "YP-09-00: YiPet 九月需求总览 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "00-需求-需求总览.md"
source_okr: [yipet-001, yipet-002, yipet-004]
estimate_frontend: 17.0
estimate_architecture: 47.0

type: task
---

# YP-09-00: 九月迭代总览 — 开发方案

> 需求编号：YP-09-00 · 优先级：P0 · 核心人天：17.0d · 架构蓝图：47.0d (80 项)

---

## 一、九月迭代主题

**稳定性 + 合规 + 体验打磨** — 系统性修复 Chrome MV3 扩展的 6 个架构脆弱点，建立 CSP/隐私合规体系，80 项架构设计蓝图为 Q4 储备。

### 1.1 背景

八月迭代完成后，YiPet 功能覆盖率达 YiVad aiChat 的 80%+，但存在 6 个已知脆弱点——SPA 路由切换宠物消失、SW 空闲终止消息丢失、SSE 断连无重连、ApiClient 绕过、CSP 未配置、CDN 散落。九月以"零缺陷发布"为目标系统性修复。

### 1.2 核心决策

| 决策 | 选择 | 理由 |
|------|------|------|
| SPA 路由检测 | MutationObserver + popstate 双重监听 | pushState 不触发 popstate |
| SW 消息可靠性 | chrome.storage.local 消息队列 + chrome.alarms 心跳 | 双重保障 |
| SSE 重连 | 指数退避 + chunk 序号去重 | 避免重复 token + 惊群效应 |
| API 强制代理 | ESLint no-restricted-imports | 编译期拦截，非人工审查 |
| CSP | `script-src 'self'` + `object-src 'none'` + `connect-src` 白名单 | CWS 审核强制要求 |
| CDN 管理 | CDN_CATALOG 统一清单 + window[global] 去重 | 防重复注入 |

---

## 二、交付模块

### 2.1 核心模块 (YP-09-01 ~ YP-09-08, 17.0d)

| # | 模块 | 需求编号 | 核心交付 | 人天 | 风险 |
|---|------|---------|---------|------|------|
| 1 | Content Script 稳定性 | YP-09-01 | MutationObserver + popstate、`__YIPET_LOADED__` 状态机、注入失败重试 | 3.0 | 高 |
| 2 | Service Worker 可靠性 | YP-09-02 | chrome.alarms 心跳、消息队列持久化、指数退避重试 | 3.0 | 高 |
| 3 | SSE 流式可靠性 | YP-09-03 | 指数退避重连、chunk 序号去重、AbortSignal 清理 | 2.0 | 中 |
| 4 | API 架构合规 | YP-09-04 | ApiClient 强制代理、fetch 直接调用 ESLint 拦截、参数名 CI 检查 | 2.0 | 中 |
| 5 | 聊天窗口交互优化 | YP-09-05 | 流式阶段动画、工具调用卡片、键盘快捷键面板 | 2.0 | 低 |
| 6 | 安全合规 | YP-09-06 | CSP 加固、Privacy Manifest、权限最小化 | 3.0 | 中 |
| 7 | 国际化 | YP-09-07 | MessageKey 类型联合 (79+)、t() 三层回退、语言热切换 | 1.0 | 低 |
| 8 | CDN 资源加载 | YP-09-08 | CDN_CATALOG、CdnInjector 工厂、window[global] 去重 | 1.0 | 低 |

### 2.2 架构设计蓝图 (YP-09-09 ~ YP-09-88, 47.0d)

80 项蓝图覆盖 6 个领域 — 性能优化 (18)、安全增强 (12)、可扩展性 (20)、用户体验 (15)、质量工程 (10)、平台兼容 (5)。详见各 PRD 文件。

---

## 三、架构总览

```
修复前 (八月末):                    修复后 (九月末):
SPA 路由切换 → 宠物消失            MutationObserver + popstate → 宠物始终保持
SW 空闲终止 → 消息丢失             chrome.alarms 心跳 + 消息队列 → 零丢失
SSE 断连 → 回复截断(无提示)        指数退避重连 + chunk 去重 → 自动恢复
fetch 绕过 ApiClient → 参数错误    ESLint 强制 ApiClient + CI 检查 → 零绕过
CSP 未配置 → CWS 审核风险          CSP + Privacy Manifest → 审核就绪
CDN 散落各处 → 重复注入            CDN_CATALOG + CdnInjector → 统一管理
```

---

## 四、技术风险与缓解

| # | 风险 | 概率 | 影响 | 缓解 |
|---|------|------|------|------|
| R1 | MutationObserver 高频 DOM 变更导致性能退化 | 中 | 中 | 200ms 节流 + 仅监听 body 子节点 |
| R2 | chrome.alarms SW 终止后不触发 | 低 | 高 | alarms 心跳 + SW 恢复时主动从 storage 恢复 |
| R3 | SSE chunk 序号后端重启后重置 | 低 | 中 | chunk 序号绑定 requestId |
| R4 | ESLint 规则误拦截合法 fetch | 低 | 低 | 仅拦截直接 `fetch(`，允许 apiClient.fetch |
| R5 | CSP connect-src 遗漏新增端点 | 中 | 中 | CI 校验 manifest CSP 与实际 fetch 一致性 |

---

## 五、里程碑

| 里程碑 | 交付物 | 验证标准 |
|--------|--------|----------|
| M1 — CS+SW 稳定性 (3d) | SPA 路由保持 + SW 消息队列 + 心跳 | SPA 路由切换 5 次宠物不消失；SW 终止后消息在 3 次重试内送达 |
| M2 — SSE+API 可靠性 (2d) | SSE 重连 + chunk 去重 + ApiClient 强制代理 | 断网 2s 恢复后消息完整；fetch 直接调用被 ESLint 拦截 |
| M3 — 安全合规 (3d) | CSP + Privacy Manifest + 权限最小化 | CWS 审核自查 10 项全通过 |
| M4 — 体验+i18n+CDN (2d) | 流式动画 + 79+ i18n keys + CDN_CATALOG | 语言热切换；CDN 资源零重复注入 |

---

## 六、完成定义 (迭代级)

- [ ] 8 个核心模块按 §2.1 交付清单全部完成
- [ ] SPA 路由切换 5 次 → 宠物始终可见
- [ ] SW 空闲 30s 终止 → 消息在 3 次重试内成功送达
- [ ] SSE 断网 2s 恢复 → 自动重连，消息完整无重复
- [ ] `grep -r 'fetch(' src/ --include="*.vue" | grep -v api-client` 零匹配
- [ ] CSP 配置通过 CWS 审核自查 10 项
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` CSP 零违规
- [ ] `npm test` 全量通过 (97 个已有测试用例)
- [ ] 80 项架构蓝图文档全部编写完成