---

doc_type: task
prd_task_id: "YP-09-109"
title: "YP-09-109: 代码质量与安全加固 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "109-基础设施-代码质量与安全加固.md"
tags: [code-quality, security, storage, hardening, bug-fix]

type: task
---

# YP-09-109: 代码质量与安全加固 — 技术设计

> **版本**：v1.0 · **人天**：1.0d · **PRD**：[109-基础设施-代码质量与安全加固.md](../../prds/2026-09/109-基础设施-代码质量与安全加固.md)

---

## 1. 业务上下文

YiPet 在快速迭代中积累了 14 个可修复缺陷，涵盖存储持久化、安全、API 路径和代码质量四个领域。本任务对全代码库进行系统性审计和修复。

**PRD**：[YP-09-109](../../prds/2026-09/109-基础设施-代码质量与安全加固.md)

## 2. 架构

### 存储持久化数据流（修复前后对比）

```
修复前（断裂）:
  _persistSetting('sidebarWidth', 320)
    → chrome.storage.local.set({ 'yipet:sidebarWidth': 320 })
  _loadPersistedState()
    → chrome.storage.local.get(['sidebarWidth'])  // ❌ 键名不匹配
    → result.sidebarWidth === undefined            // 设置丢失

修复后:
  _persistSetting('sidebarWidth', 320)
    → chrome.storage.local.set({ 'yipet:sidebarWidth': 320 })
  _loadPersistedState()
    → chrome.storage.local.get(['yipet:sidebarWidth'])  // ✅ 一致
    → result['yipet:sidebarWidth'] === 320              // 正常恢复
```

### Compaction 数据流（修复前后对比）

```
修复前:
  maybeCompact → callCompactApi → fetch('/')  // ❌ 发送到页面 origin
    → 第三方页面上请求发送到 https://example.com/

修复后:
  maybeCompact → callCompactApi → getClient().rpc(...)  // ✅ ApiClient 路径
    → POST http://localhost:10086/  → RPC 信封 → unwrapEnvelope
```

### 安全加固对比

```
修复前:
  mermaid.initialize({ securityLevel: 'loose' })   // ❌ 允许任意 HTML/JS
  decodeHTMLEntities: div.innerHTML = html          // ❌ XSS 风险

修复后:
  mermaid.initialize({ securityLevel: 'strict' })   // ✅ HTML 标签转义
  decodeHTMLEntities: textarea.innerHTML = html     // ✅ 浏览器纯文本语义
```

## 3. 变更清单

### A. chat/stores/chat.ts — 主 Store（6 处修改）

**文件**: `YiPet/src/chat/stores/chat.ts`

| 行号 | 变更 | 说明 |
|------|------|------|
| 19 | 导入 `getClient` | 新增 ApiClient 访问 |
| 238-246 | `useConversationCompact` deps 新增 `rpcCall` | 注入 ApiClient RPC 函数 |
| 271-274 | `injectServices` 签名补 `client` + `dashboard` | 类型完整 |
| 375-400 | `_loadPersistedState` 全部读键加 `yipet:` 前缀 | 6 键修复 |
| 1001-1003 | `ragContentSummary` 添加 `\|\| 'unknown'` fallback | 防 undefined 传播 |
| 1078 | `pushPromptHistory` 传原始数组而非 `JSON.stringify` | 防双重序列化 |

### B. content/cdn/injector.ts — CDN 注入器

| 行号 | 变更 | 说明 |
|------|------|------|
| 64-75 | 移除 `loadCSS` 中重复的 `loaded.set` + 死代码 `onload` | 消除死代码 |

### C. content/ipc/relay.ts — IPC 中继

| 行号 | 变更 | 说明 |
|------|------|------|
| 132 | `apiBase` 从 `localhost:8848/api` 改为 `localhost:10086` | 正确端口 |

### D. chat/composables/useConversationCompact.ts — 会话压缩

| 行号 | 变更 | 说明 |
|------|------|------|
| 8-11 | `ConversationCompactDeps` 新增 `rpcCall` 字段 | 依赖注入 |
| 23-58 | `callCompactApi` 重构为优先使用 `rpcCall` | 走 ApiClient 路径 |

### E. chat/stores/services.ts — 服务层

| 行号 | 变更 | 说明 |
|------|------|------|
| 5-7 | 导入 `ApiClient` 类型 | 类型导入 |
| 9 | 新增 `_client` 变量 | 存储 client 引用 |
| 30-34 | `injectServices` 签名补 `client` + `dashboard` | 注入 client |
| 45 | 新增 `getClient()` 导出 | 暴露 client 访问 |

### F. 其他文件

| 文件 | 变更 |
|------|------|
| `chat/index.ts:77` | `injectServices` 调用传入 `client: api.client` |
| `chat/types.ts:10` | 移除未使用的 `TodoItem` 导入 |
| `chat/utils.ts:162` | Mermaid `securityLevel: 'loose'` → `'strict'` |
| `content/bootstrap.ts:58,72,101` | 移除 3 处双分号 `;;` |
| `shared/i18n/index.ts:254` | 移除重复的 `aboutFeatureI18n` |
| `shared/utility-tools.ts:260-264` | `decodeHTMLEntities` 改用 `<textarea>` |

## 4. 关键决策

| 决策 | 理由 |
|------|------|
| 统一用 `yipet:` 前缀而非移除前缀 | `yipet:` 前缀是 `_persistSetting` 的设计意图，且 RAG 键已使用此前缀 |
| `windowState` → `yipet:chatWindowState` | 写入键原本就是 `chatWindowState`，读取键名不一致是 bug |
| `useConversationCompact` 注入 `rpcCall` 而非直接导入 ApiClient | 遵循现有依赖注入模式，避免循环依赖 |
| 保留 `enums/index.ts` 和 `createPopupConfig` 不删除 | 项目铁律：不改相邻代码 |

## 5. 验证

```bash
npm run typecheck    # TypeScript strict 模式 ✓
npm test             # 138/138 测试通过 ✓
npm run build        # 4 个 Rsbuild 入口构建成功 ✓
```

## 6. 文档产出

11 篇 bug 报告写入 `YiKnowledge/projects/yipet/bugs/2026-09/代码质量/`：

| 编号 | 标题 |
|------|------|
| 58 | RAG 检索摘要 undefined 传播 |
| 59 | promptHistory 存储键名不一致 + 双重序列化 |
| 60 | 6 键存储前缀不匹配 |
| 61 | Mermaid 安全级别 loose |
| 62 | decodeHTMLEntities XSS 风险 |
| 63 | CDN loadCSS 重复标记 |
| 64 | relay.ts apiBase 错误端口 |
| 65 | bootstrap 双分号 |
| 66 | compaction 绕过 ApiClient |
| 67 | 死代码扫描 |
| 68 | MessageKey 重复定义 |