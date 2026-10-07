---

doc_type: test
title: "前端集成（YiAi 路由 + 降级） — 测试方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["86-prd-task-前端集成YiAi路由降级"]

type: test
---

# 前端集成（YiAi 路由 + 降级） — 测试方案

> 来源模块：[86-prd-task-前端集成YiAi路由降级](../../devs/2026-09/86-prd-task-前端集成YiAi路由降级.md)

---

## TC-FE-001: AI 引擎走 YiAi RPC

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 确保 YiAi 运行在 :10086 | — |
| 2 | 在 YiPot 中使用 OpenAI 翻译 | — |
| 3 | 检查 Network 面板 | 请求到 `localhost:10086/` |
| 4 | 翻译结果显示 | 正常显示 |

## TC-FE-002: YiAi 不可用 — 降级到直接 API

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 停止 YiAi 服务 | — |
| 2 | 在 YiPot 中使用 OpenAI 翻译 | — |
| 3 | 检查控制台日志 | "YiAi fallback" 消息 |
| 4 | 检查 Network | 请求到 `api.openai.com` |
| 5 | 翻译结果显示 | 正常（用户无感知） |

## TC-FE-003: 传统引擎不经过 YiAi

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 使用 Google 翻译 | — |
| 2 | 检查 Network | 请求到 `translate.google.com` |
| 3 | 无请求到 `localhost:10086` | Network 中无 YiAi 请求 |

## TC-FE-004: 传统引擎不经过 YiAi (Baidu)

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 使用 Baidu 翻译 | — |
| 2 | 检查 Network | 请求到 `fanyi-api.baidu.com` |

## TC-FE-005: shouldUseYiAi 判断

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `shouldUseYiAi("openai")` | `true` |
| 2 | `shouldUseYiAi("ollama")` | `true` |
| 3 | `shouldUseYiAi("chatglm")` | `true` |
| 4 | `shouldUseYiAi("geminipro")` | `true` |
| 5 | `shouldUseYiAi("google")` | `false` |
| 6 | `shouldUseYiAi("baidu")` | `false` |
| 7 | `shouldUseYiAi("deepl")` | `false` |

## TC-FE-006: 语言代码映射

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `mapLang("zh_cn")` | `"zh"` |
| 2 | `mapLang("zh_tw")` | `"zh-TW"` |
| 3 | `mapLang("en")` | `"en"`（透传） |
| 4 | `mapLang("unknown")` | `"unknown"`（透传） |

## TC-FE-007: 插件引擎不受影响

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 安装并使用翻译插件 | — |
| 2 | 检查执行路径 | Rust `invoke_plugin` 调用 |
| 3 | 翻译结果显示 | 正常 |

## TC-FE-008: 翻译回译也走 YiAi

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | OpenAI 翻译得到结果 | — |
| 2 | 点击"回译"按钮 | — |
| 3 | 如果使用 AI 引擎 | 同样走 YiAi RPC 路径 |
| 4 | 回译结果 | 正常显示 |

## TC-FE-009: YiPot 构建

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `cd YiPot && pnpm build` | 构建成功 |
| 2 | 检查构建产物 | `dist/` 存在 |
| 3 | 无 TypeScript 类型错误 | — |

## TC-FE-010: handleTranslateSuccess 一致性

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | YiAi 路径翻译成功 | 触发 `handleTranslateSuccess` |
| 2 | 降级路径翻译成功 | 触发同一个 `handleTranslateSuccess` |
| 3 | 两种路径的结果展示 | UI 行为完全一致（复制/历史/语音） |