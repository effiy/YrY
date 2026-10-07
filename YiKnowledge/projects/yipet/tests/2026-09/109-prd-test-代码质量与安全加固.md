---

doc_type: test
prd_test_id: "YP-09-109"
title: "YP-09-109: 代码质量与安全加固 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "109-基础设施-代码质量与安全加固.md"
tags: [code-quality, security, storage, testing]

type: test
---

# YP-09-109: 代码质量与安全加固 — 测试方案

> **版本**：v1.0 · **PRD**：[109-基础设施-代码质量与安全加固.md](../../prds/2026-09/109-基础设施-代码质量与安全加固.md)

---

## 1. 测试策略

| 层级 | 方法 | 覆盖目标 |
|------|------|----------|
| 静态分析 | `vue-tsc --noEmit --skipLibCheck` | 零类型错误 |
| 单元测试 | Vitest (138 测试) | 零回归 |
| 构建验证 | Rsbuild 4 入口构建 | 构建成功 |
| 手工验证 | Chrome 扩展加载 + 功能冒烟 | 关键路径 |

## 2. 测试用例

### TC-01: 存储持久化 — 侧边栏宽度

```
前置: 打开聊天窗口，拖拽侧边栏到非默认宽度（如 400px）
步骤:
  1. 在 Chrome 扩展管理页刷新 YiPet 扩展
  2. 重新打开任意页面
  3. 打开聊天窗口
预期: 侧边栏宽度恢复为 400px（而非默认 320px）
验证键: chrome.storage.local 中 yipet:sidebarWidth === 400
```

### TC-02: 存储持久化 — 聊天窗口位置

```
前置: 拖拽聊天窗口到非默认位置（如 x=200, y=300）
步骤:
  1. 刷新扩展
  2. 重新打开聊天
预期: 窗口恢复至 (200, 300) 位置
验证键: chrome.storage.local 中 yipet:chatWindowState.x === 200
```

### TC-03: 存储持久化 — 颜色主题

```
前置: 在 Popup 中选择非默认颜色（如 Ocean, index=5）
步骤:
  1. 刷新扩展
  2. 打开 Popup 查看颜色选择
预期: 颜色选择器高亮 Ocean
验证键: chrome.storage.local 中 yipet:chatColorIndex === 5
```

### TC-04: 存储持久化 — 侧边栏折叠状态

```
前置: 展开侧边栏（sidebarCollapsed = false）
步骤:
  1. 刷新扩展
预期: 侧边栏保持展开状态
验证键: chrome.storage.local 中 yipet:sidebarCollapsed === false
```

### TC-05: 存储持久化 — 提示词历史

```
前置: 在聊天中输入 3 条消息
步骤:
  1. 刷新扩展
  2. 打开聊天，在空输入框中按 ArrowUp
预期: 能回溯到最近一条提示词
验证键: chrome.storage.local 中 yipet:promptHistory 为数组（非字符串）
```

### TC-06: Mermaid 安全级别

```
步骤:
  1. 发送包含 Mermaid 代码块的消息
  2. 检查渲染的 SVG 中是否包含原始 HTML 标签
预期: HTML 标签被转义（如 &lt;script&gt;），而非直接渲染
代码检查: chat/utils.ts 中 securityLevel === 'strict'
```

### TC-07: decodeHTMLEntities 安全

```
输入: '<img src=x onerror=alert(1)>'
预期输出: '<img src=x onerror=alert(1)>'  (纯文本，无脚本执行)
代码检查: 使用 textarea 而非 div 做 innerHTML 解析
```

### TC-08: Compaction 通过 ApiClient

```
代码检查:
  - useConversationCompact.ts 中 callCompactApi 接受 rpcCall 参数
  - chat.ts 中注入 rpcCall: getClient().rpc(...)
  - 不再存在 fetch('/') 调用
测试: npm test 中无 compaction 相关测试失败
```

### TC-09: relay.ts apiBase 正确端口

```
代码检查: relay.ts 中 chatEl.dataset.apiBase === 'http://localhost:10086'
验证: 在非 localhost 页面打开聊天，API 请求应发送到 localhost:10086
```

### TC-10: RAG 检索摘要

```
前置: 开启 Knowledge Grounded，提问触发 RAG 检索
步骤:
  1. 查看最新 pet 消息的检索摘要
预期: 显示 "file.md +2" 格式，而非 "undefined +2"
边界: RagSource.path 为 undefined 时显示 "unknown +N"
```

### TC-11: TypeScript 类型检查

```bash
npm run typecheck
预期: 零错误输出（仅 npm warn 忽略）
```

### TC-12: 回归测试套件

```bash
npm test
预期: 16 个测试文件全部通过，138 个测试用例 0 失败
```

## 3. 测试环境

| 配置项 | 值 |
|--------|-----|
| 浏览器 | Chrome 130+ |
| Node.js | 25.x |
| 测试框架 | Vitest 2 + jsdom 29 |
| 类型检查 | vue-tsc 2.x |
| 构建工具 | Rsbuild 1.7 |

## 4. 测试结果

```
=== 静态分析 ===
npm run typecheck             ✓ PASS (零错误)

=== 单元测试 ===
npm test (16 files, 138 tests) ✓ PASS
  tests/config/data.test.ts     ✓ 8 tests
  tests/config/config.test.ts    ✓ 9 tests
  tests/api/client.test.ts      ✓ 10 tests
  tests/api/endpoints.test.ts   ✓ 7 tests
  tests/api/translation.test.ts ✓ 6 tests
  tests/shared/locale.test.ts   ✓ 15 tests
  tests/shared/datetime.test.ts ✓ 16 tests
  tests/shared/i18n.test.ts     ✓ 9 tests
  tests/shared/url.test.ts      ✓ 9 tests
  tests/shared/timezone.test.ts ✓ 7 tests
  tests/content/catalog.test.ts ✓ 10 tests
  tests/chat/findSessionByUrl.test.ts ✓ 7 tests
  tests/popup/services/connect.test.ts ✓ 2 tests
  tests/popup/services/notify.test.ts  ✓ 4 tests
  tests/mocks/sessions.test.ts   ✓ 4 tests

=== 构建验证 ===
npm run build                   ✓ PASS
  dist/assets/popup.js
  dist/assets/chat.js
  dist/assets/cdn.js
  dist/assets/bootstrap.js
```

## 5. 已知限制

- TC-01~05 需要手工在 Chrome 扩展环境中验证（chrome.storage API 在 jsdom 中不可用）
- Compaction 端到端测试需要 YiAi 后端运行
- 手工测试已验证核心存储持久化路径