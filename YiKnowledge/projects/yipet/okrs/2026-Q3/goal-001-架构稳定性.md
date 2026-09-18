---
type: okr-goal
id: yipet-001
title: "扩展架构稳定性与安全合规"
status: completed
period: "2026 Q3"
owner: 陈铭
project: YiPet
project_id: yipet
progress: 100
updated: 2026-09-14
kr1: "SSE 流式断连自动重连 — 指数退避 + AbortSignal 清理 + 错误从 SW 正确传播到 Chat Window"
kr1_completion: 100
kr2: "4-Tier API 分层架构全面落地 — 消除组件中裸 fetch，100% HTTP 经 ApiClient"
kr2_completion: 100
kr3: "Service Worker 生命周期状态机 — install/activate/fetch 四状态完整覆盖 + 终止后恢复"
kr3_completion: 100
kr4: "IPC_SECRET + 时间戳验证的跨世界安全通信 — 防恶意页面伪造消息"
kr4_completion: 100
kr5: "多标签页状态同步 — chrome.storage.local + onChanged 事件驱动"
kr5_completion: 100
kr6: "Rsbuild 4 入口并行构建 + MV3 CSP 合规 — 零远程代码/零 eval/零内联脚本"
kr6_completion: 100
metric1_id: "yipet-m01"
metric1_desc: "SSE 断连恢复时间"
metric1_current: "<3s"
metric1_target: "<5s"
metric2_id: "yipet-m02"
metric2_desc: "IPC 消息验证通过率"
metric2_current: "100%"
metric2_target: "100%"
metric3_id: "yipet-m03"
metric3_desc: "SW 生命周期状态覆盖率"
metric3_current: "4/4"
metric3_target: "4/4"
metric4_id: "yipet-m04"
metric4_desc: "API 调用合规率（经 ApiClient）"
metric4_current: "100%"
metric4_target: "100%"
related_prds:
  - projects/yipet/prds/2026-09/10-稳定性-SSE流式.md
  - projects/yipet/prds/2026-09/11-合规-API架构.md
  - projects/yipet/prds/2026-09/19-架构设计-SW生命周期状态机.md
  - projects/yipet/prds/2026-09/38-架构设计-多标签页同步.md
  - projects/yipet/prds/2026-09/100-基础设施-构建优化与产物分析.md
  - projects/yipet/prds/2026-09/21-架构设计-扩展更新与版本迁移.md
---

# 扩展架构稳定性与安全合规

> Q3 核心工程目标。针对 Chrome MV3 扩展的 6 个架构脆弱点进行系统性加固——SSE 流式、API 分层、SW 生命周期、IPC 安全、多标签页同步、构建合规。**全部 6 个 KR 达成，97 个测试用例通过。**

---

## 背景

YiPet 在 2026-07 完成了 Vue 2 → Vue 3.5 技术栈升级和聊天窗口重构。但架构层面存在 6 个脆弱点，每个在特定场景下导致服务中断：

**SSE 断连不重连**：Chat Window 通过 Service Worker 代理 SSE 连接到 YiAi。网络波动或 SW 被浏览器终止后，连接断开但前端不重连——用户看到消息"凝固"，需手动刷新页面。

**API 调用散落**：部分组件绕过 ApiClient 直接用 `fetch()` 发送 RPC 请求，参数名错误（`query` 而非 `filter`）被后端静默忽略——查询条件丢失但返回成功，排查耗时 2h+。

**SW 状态丢失**：Chrome 在空闲 30s 后终止 Service Worker。重新激活时 SW 的状态从头初始化，之前的会话映射、SSE 连接全部丢失，消息路由中断。

**IPC 不安全**：Content Script 和 Service Worker 之间通过 `chrome.runtime.sendMessage` 通信，无消息验证——恶意页面可伪造消息触发扩展行为。

**多标签页不同步**：用户在标签页 A 切换角色，标签页 B 不变——同一扩展在不同标签页中显示不同状态。

**CSP 违规**：构建产物包含远程 CDN 脚本和内联 `eval()`，不符合 MV3 CSP 要求（禁止远程代码、禁止 eval、禁止内联脚本）。

---

## 设计决策

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| SSE 重连策略 | 固定间隔重试 | 指数退避 + 抖动 | **指数退避** | 避免惊群，网络恢复后快速重连 |
| IPC 安全 | 消息签名（HMAC） | IPC_SECRET + 时间戳 | **Secret + TS** | 防重放 + 实现简单，HMAC 对扩展场景过重 |
| 跨标签页同步 | BroadcastChannel | chrome.storage.onChanged | **storage.onChanged** | SW 也可监听，跨世界统一 |
| 构建工具 | webpack | Rsbuild 4 | **Rsbuild 4** | 原生支持多入口并行，零配置 CSS Modules |

---

## 季度演进

### 八月 — 基础设施调研

主要完成 MV3 迁移准备和架构评审。确认了 Chrome 对 SW 的终止策略（idle 30s）、CSP 限制细则（`script-src 'self'` 不允许 `wasm-unsafe-eval`）、Rsbuild 对多入口的支持程度（实验性但可用）。

### 九月 — 集中攻坚

六个轨道并行推进，每轨道独立交付：

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | SSE 流式断连自动重连 | 100% |
| KR2 | 4-Tier API 分层架构落地 | 100% |
| KR3 | SW 生命周期状态机 | 100% |
| KR4 | IPC 安全通信 | 100% |
| KR5 | 多标签页状态同步 | 100% |
| KR6 | 构建优化 + CSP 合规 | 100% |

---

## KR1 — SSE 流式断连自动重连

**问题**：`ApiClient.stream()` 在 `fetch()` 的 `ReadableStream` 断开后不重连，Promise reject 后流就死了。

**修复**（`src/services/stream.ts`）：
- `fetch()` 包装为 `withRetry(fetch, { maxRetries: 5, backoff: "exponential", jitter: true })`
- 重连间隔：1s → 2s → 4s → 8s → 16s（max），带 ±25% 抖动
- `AbortSignal` 统一管理：组件卸载时 `signal.abort()` → 清理所有进行中的 fetch 和定时器
- 错误传播链：Service Worker `onfetch` 异常 → `chrome.runtime.sendMessage` → Chat Window 错误提示（非静默失败）

**验证**：断开网络 5s → 重连后 SSE 自动恢复，用户无感知。97 个测试用例覆盖重连逻辑（Vitest + jsdom mock `fetch`）。

---

## KR2 — 4-Tier API 分层架构

**架构**：

```
Component (Vue SFC)
  → Chat Store (Pinia — 状态管理，不直接调用 fetch)
    → ApiClient (src/services/api-client.ts — fetch 封装 + RPC 信封)
      → fetch (浏览器原生)
```

**合规成果**：
- 组件中裸 `fetch()` 调用：3 → 0（全部消零）
- `filter`/`query` 参数名 bug：修复 2 处（SessionService.list/get）
- 新增 Service（KnowledgeService、RagService、BugService）均遵循四层规范

**验证**：`grep -r "fetch(" src/ --include="*.ts" --include="*.vue" | grep -v "api-client"` → 0 结果

---

## KR3 — SW 生命周期状态机

四状态：`installing` → `waiting` → `activated` → `terminated`

| 状态 | 触发 | SW 行为 |
|------|------|---------|
| installing | 新版本安装 | 预缓存静态资源 |
| waiting | 旧版本仍在运行 | 等待 `skipWaiting()` 或旧版本终止 |
| activated | 接管页面 | 从 chrome.storage.local 恢复会话映射 + 重建 SSE 连接池 |
| terminated | 浏览器回收 | 状态写入 storage，消息路由标记为待重放 |

关键实现：`activated` 时读 `chrome.storage.local` 恢复状态——SW 被终止后的恢复时间 <100ms。

---

## KR4 — IPC 安全通信

每条跨世界消息携带：

```typescript
interface SecureMessage {
  type: string;
  payload: unknown;
  meta: {
    timestamp: number;    // Date.now()
    secret: string;       // crypto.randomUUID() 在安装时生成
  };
}
```

接收方验证：`Date.now() - meta.timestamp < 5000`（5s 窗口防重放）+ `meta.secret === IPC_SECRET`（防伪造）。

封装为 `dispatchSecureEvent(type, payload)` → CustomEvent，所有跨世界通信走此函数。

---

## KR5 — 多标签页状态同步

数据流：

```
Tab A 修改角色
  → Chat Store.setRole(role)
    → chrome.storage.local.set({ role })
      → chrome.storage.onChanged(role)
        → Tab B Chat Store 响应 → 更新 UI
```

所有持久化状态（角色、颜色、模型、聊天历史）走此通道。`onChanged` 在 Service Worker 和所有 Content Script 中均触发，跨世界统一。

---

## KR6 — 构建优化 + CSP 合规

**构建**：Rsbuild 4 四入口并行构建（popup/chat/cdn/bootstrap），`build:pro` 从 45s → 18s。

**CSP 合规**（`manifest.json`）：

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'self'"
}
```

合规动作：
- 所有 vendor 库（vue、marked、echarts）本地化 → 打包进 `lib/` 目录
- `eval()` → 重构为数据驱动逻辑
- 内联脚本 → 提取为独立 `.js` 文件
- 远程 CDN 资源 → 本地化

**验证**：Chrome Web Store 审核通过（CSP 零违规），`pnpm build` 产物零 `unsafe-eval` 警告。

---

## 影响

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| SSE 断连恢复 | 需手动刷新 | 自动重连 <3s |
| API 调用合规率 | 3 处裸 fetch | 100% 经 ApiClient |
| SW 终止后恢复 | 状态丢失 | <100ms 恢复 |
| IPC 安全 | 无验证 | Secret + TS，100% 验证通过 |
| 多标签页同步 | 不一致 | 实时同步 |
| 构建时间 | 45s | 18s |
| CSP 违规 | 3 处 | 0 |