---

doc_type: test
prd_test_id: "YP-09-100"
title: "YP-09-100: 即时翻译功能 — 选中文本即时翻译 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate: 0.25
source_task: "100-prd-task-即时翻译功能.md"
source_prds: ["100-基础设施-即时翻译功能"]
tags: [test, translation, chrome-extension, api-layer, edge-cases]

type: test
---

# YP-09-100: 即时翻译功能 — 测试方案

> **版本**：v2.0 · **人天**：0.25d · **状态**：已完成

---

## 1. 测试范围

| 维度 | 说明 |
|------|------|
| API 层 | `TranslationService` 工厂函数 |
| Store | `chat.ts` `translateSelection` 操作 |
| 注入链 | `index.ts` → `chat.ts` → `services.ts` |
| 依赖 | YiAi 后端需运行 |

---

## 2. 功能测试

### TC-01：TranslationService API

| # | 场景 | 期望 |
|---|------|------|
| 1.1 | `translate({text: "Hello", to_lang: "zh"})` | 返回 `[{provider, text, from_lang, to_lang}]` |
| 1.2 | `translate({text: "Hello", use_memory: true})` | 二次调用 cached=true |
| 1.3 | `queryHistory({pageSize: 5})` | 返回 `{list: [...], total: N}` |
| 1.4 | `feedback({source, target, rating: "good"})` | 返回 `{success: true}` |
| 1.5 | `feedback({rating: "bad"})` | 返回 `{success: true}` |

### TC-02：translateSelection 操作

| # | 场景 | 期望 |
|---|------|------|
| 2.1 | 页面选中 "Hello World" | 译文写入 `inputTemplate` |
| 2.2 | 聊天窗口关闭 | 自动打开（`state.visible = true`） |
| 2.3 | 选中单字符 "A" | 提示 "Select text first"（长度 < 2） |
| 2.4 | 未选中任何文本 | 提示信息通知 |

### TC-03：服务注入链

| # | 场景 | 期望 |
|---|------|------|
| 3.1 | `getTranslation()` 调用 | 返回已注入的 TranslationService 实例 |
| 3.2 | 未注入时调用 | 返回 undefined（不崩溃） |
| 3.3 | `ApiServices` 接口完整性 | `translation` 字段存在 |

---

## 3. 边界与异常测试

### TC-10：错误处理

| # | 场景 | 期望 |
|---|------|------|
| 10.1 | YiAi 不可达 | `notify("Translation failed", "error")` |
| 10.2 | 翻译返回空文本 | `notify("Translation returned empty", "warning")` |
| 10.3 | RPC 超时 | `notify(err.message, "error")` |
| 10.4 | 网络断开 | 错误通知，不影响其他聊天功能 |

### TC-11：特殊输入

| # | 输入 | 期望 |
|---|------|------|
| 11.1 | 纯空格 "   " | trim 后长度 < 2，提示选择文本 |
| 11.2 | 超长文本（5000 字符） | 正常翻译（YiAi 支持长文本） |
| 11.3 | 含特殊字符 "Hello\nWorld\t!" | 正常翻译 |
| 11.4 | 含 HTML 标签 "<div>text</div>" | 正常翻译（纯文本传递） |
| 11.5 | 纯数字 "12345" | 正常翻译 |
| 11.6 | 纯 emoji "👋🌍" | 正常翻译 |

---

## 4. 回归测试

| # | 验证内容 |
|---|---------|
| R1 | `npm run typecheck` 无类型错误 |
| R2 | `npm run build` 构建成功（4 入口） |
| R3 | `npm test` 132/132 通过 |
| R4 | ChatService 原有功能（chat/stream）不受影响 |
| R5 | RagService 原有功能不受影响 |
| R6 | 弹窗皮肤中心正常 |

---

## 5. 安全测试

| # | 场景 | 期望 |
|---|------|------|
| S1 | API Key 不暴露在前端 | TranslationService 不包含 API Key，由 YiAi 后端管理 |
| S2 | 翻译内容仅发本地 YiAi | `localhost:10086`，不出公网 |
| S3 | `window.getSelection()` 跨域限制 | Chrome MV3 无额外限制，任何标签页可读取选中文本 |

---

## 6. 测试命令

```bash
cd YiPet && npm run typecheck && npm run build && npm test
```