---

doc_type: test
title: "TTS + 生词本 Provider — 测试方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["83-prd-task-TTS生词本Provider适配器"]

type: test
---

# TTS + 生词本 Provider — 测试方案

> 来源模块：[83-prd-task-TTS生词本Provider适配器](../../devs/2026-09/83-prd-task-TTS生词本Provider适配器.md)
> 父测试方案：[95-prd-test-YiAi后端集成](./95-prd-test-YiAi后端集成.md)

---

## 测试范围

覆盖 1 个 TTS Provider（Lingva）和 2 个生词本 Provider（Anki、Eudic）的 RPC 调用、数据格式验证和错误处理。

| Provider | 类型 | 部署方式 | 关键验证点 |
|----------|------|---------|-----------|
| Lingva | TTS | 在线 API | GET 请求、base64 音频返回、URL 自动补全 |
| Anki | 生词本 | 本地 AnkiConnect (:8765) | 三步序列（createDeck→createModel→addNote）、幂等性 |
| Eudic | 生词本 | 在线 API | Token 认证、HTTP POST |

---

## 测试环境

| 依赖 | 说明 |
|------|------|
| YiAi 运行中 | `cd YiAi && python main.py` (:10086) |
| Lingva 实例 | 默认 `lingva.pot-app.com`，或自定义 URL |
| Anki 桌面端 | 需安装 AnkiConnect 插件并运行 |
| Eudic Token | 有效的欧路词典 API Token |

---

## 一、Lingva TTS 测试

### TC-TT-001: 基本语音合成

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `tts` → `text: "Hello", language: "en", provider: "lingva"` | HTTP 200 |
| 2 | 检查 HTTP 请求 URL | `GET /api/v1/audio/en/Hello` |
| 3 | 检查 `data.audio` | base64 编码的音频数据 |
| 4 | 检查 `data.format` | `"mp3"` |
| 5 | 检查 `data.provider` | `"lingva"` |

### TC-TT-002: 自定义 URL

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `config.request_path: "https://custom-lingva.example.com"` | — |
| 2 | RPC `tts` 调用 | HTTP 请求到自定义 URL |
| 3 | 检查响应 | 音频数据正常返回 |

### TC-TT-003: URL 自动补全

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `config.request_path: "lingva.example.com"`（无协议前缀） | — |
| 2 | RPC `tts` 调用 | URL 自动补全为 `https://lingva.example.com` |

### TC-TT-004: 空文本处理

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `tts` → `text: ""` | — |
| 2 | Lingva API 返回错误或空音频 | Provider 正常返回，不 crash |

### TC-TT-005: 不支持的语言

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `tts` → `language: "xx"`（不存在） | Lingva API 返回错误 |
| 2 | 检查 `data.audio` | `""`（空）或 error 信息 |

---

## 二、Anki 生词本测试

### TC-CL-001: 创建卡片完整流程

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `collect` → `source: "hello", target: "你好", provider: "anki"` | HTTP 200 |
| 2 | 检查 AnkiConnect 调用序列 | 1) `createDeck` → 2) `createModel` → 3) `addNote` |
| 3 | 检查 `data.success` | `true` |
| 4 | 检查 Anki 桌面端 | "Pot" 牌组中存在 "hello→你好" 卡片 |

### TC-CL-002: 幂等性验证

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 第一次 `collect("hello", "你好", "anki")` | `success: true` |
| 2 | 第二次 `collect("hello", "你好", "anki")` | `success: true`（不报错） |
| 3 | 检查 Anki 卡片数量 | 不重复 |

### TC-CL-003: AnkiConnect 不可用

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 关闭 Anki 桌面端 | AnkiConnect 端口无响应 |
| 2 | RPC `collect("hello", "你好", "anki")` | 连接被拒绝 |
| 3 | 检查 `data.success` | `false` |
| 4 | 检查 `data.error` | 非空错误信息 |

### TC-CL-004: 自定义端口

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `config.port: 18765` | — |
| 2 | RPC `collect` | 请求到 `127.0.0.1:18765` |

---

## 三、Eudic 生词本测试

### TC-CL-005: 保存词汇

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `collect` → `provider: "eudic"`, `config: {token: "valid"}` | HTTP 200 |
| 2 | 检查 HTTP 请求 URL | `POST https://api.eudic.net/v1/word/save` |
| 3 | 检查请求 Body | `{word, translation, token}` |
| 4 | 检查 `data.success` | `true` |

### TC-CL-006: Token 无效

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `config.token: "invalid-token"` | Eudic API 返回 `code ≠ 0` |
| 2 | 检查 `data.success` | `false` |
| 3 | 检查 `data.error` | 包含 Eudic API 错误消息 |

### TC-CL-007: 未知 Provider

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `collect("hello", "你好", "unknown_provider")` | — |
| 2 | 检查 `data.success` | `false` |
| 3 | 检查 `data.error` | `"Unknown collection provider: unknown_provider"` |