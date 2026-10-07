---

doc_type: module
prd_task_id: "YP-09-S02"
title: "AI 翻译服务 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "13-prd-AI翻译服务.md"

type: task
---

# AI 翻译服务 — 开发方案

> 来源 PRD：[13-prd-AI翻译服务.md](../../prds/2026-09/13-prd-AI翻译服务.md)

## 涉及插件

| 插件 | 目录 | 特点 |
|------|------|------|
| OpenAI | `services/translate/openai/` | 自定义 Base URL + prompt |
| Ollama | `services/translate/ollama/` | 本地离线 |
| ChatGLM | `services/translate/chatglm/` | 智谱 AI |
| Gemini Pro | `services/translate/geminipro/` | Google AI |

## OpenAI 实现

```javascript
// services/translate/openai/index.jsx
export default async function translate(text, from, to, options) {
  const response = await fetch(`${options.apiUrl || "https://api.openai.com"}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model || "gpt-4o-mini",
      messages: [{
        role: "system",
        content: options.prompt || `Translate from ${from} to ${to}. Only return the translation.`
      }, {
        role: "user",
        content: text
      }]
    })
  });
  const data = await response.json();
  return { text: data.choices[0].message.content.trim(), from, to };
}
```

## Ollama 实现

```javascript
// services/translate/ollama/index.jsx
export default async function translate(text, from, to, options) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: options.model || "llama3",
      prompt: `Translate from ${from} to ${to}: ${text}`,
      stream: false
    })
  });
  const data = await response.json();
  return { text: data.response.trim(), from, to };
}
```

## 关键设计

- 所有 AI 服务共享相似的 API 调用模式（Chat Completions）
- OpenAI 兼容 API 可通过自定义 Base URL 接入第三方服务
- Ollama 不需要 API Key，自动检测本地模型列表


## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| AI 服务统一接口 | OpenAI Chat Completions 兼容格式 | 各服务原生 API | OpenAI API 格式已成为行业标准，Ollama/ChatGLM 均提供兼容端点 | 部分服务特定能力 (如 Gemini 的 safety_settings) 无法通过统一接口使用 |
| Base URL 可配 | 自定义 `apiUrl` 参数 | 固定官方端点 | 支持 API 代理/中转服务、本地 Ollama、第三方兼容 API (如 DeepSeek) | 用户需自行了解 API 端点格式 |
| Prompt 模板 | 可自定义 system prompt | 硬编码 prompt | 用户可优化翻译风格（如"保持 Markdown 格式"、"使用口语化表达"） | 不合理的 prompt 可能导致翻译质量下降 |
| 模型选择 | 插件配置中选择模型 | 自动检测可用模型 | 用户可根据成本/速度/质量自行权衡 | 需要用户了解各模型特性 |
| Ollama 本地检测 | 启动时访问 /api/tags 获取模型列表 | 手动输入模型名 | 自动填充可用模型下拉列表，降低配置门槛 | 需要 Ollama 服务已启动 |

### OpenAI 兼容 API 扩展设计

```
为什么选择 OpenAI Chat Completions 格式作为统一接口？

1. 行业标准: OpenAI/DeepSeek/通义千问/智谱/Moonshot 均兼容此格式
2. Ollama 兼容: Ollama 提供 /v1/chat/completions 兼容端点 (v0.1.0+)
3. 自定义 Base URL: 一套代码适配所有兼容服务

支持的 AI 服务矩阵:
  官方: OpenAI / Azure OpenAI / Anthropic (via 兼容层)
  本地: Ollama / LM Studio / vLLM
  第三方: DeepSeek / 通义千问 / 智谱 GLM / Moonshot / Groq
  中转: API 代理 / Cloudflare AI Gateway / One API

使用方法:
  设置 Base URL = https://api.openai.com/v1  → OpenAI 官方
  设置 Base URL = http://localhost:11434/v1   → Ollama
  设置 Base URL = https://api.deepseek.com/v1 → DeepSeek
  设置 Base URL = https://your-proxy.com/v1   → 代理/中转
```

### Prompt 设计原则

```javascript
// 默认 prompt (简洁精确)
"Translate from {from} to {to}. Only return the translation without any explanation."

// 可选增强 prompt 示例
"将以下文本翻译为{to}。保持原文的 Markdown 格式和代码块。仅返回译文。"
"Translate to {to} in a {style} tone. Style options: formal/casual/technical."
```

> Prompt 设计原则：指令清晰、输出格式约束明确、避免歧义。LLM 对明确指令的遵循度显著高于模糊指令。


## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | Ollama 服务未启动 (connection refused) | 标记 "ollama_not_running" | 用户启动 Ollama | "Ollama 服务未运行，请执行 ollama serve" |
| L1-网络 | 请求超时 (15s，LLM 推理慢) | 比普通翻译超时更长 (15s vs 10s) | 自动重试 1 次 | "AI 推理超时，正在重试..." |
| L1-网络 | DNS 解析失败 (自定义 Base URL) | 标记 "invalid_url" | 用户检查 URL | "无法解析 API 地址，请检查 Base URL" |
| L2-认证 | API Key 无效 (401) | 标记 "unauthorized" | 用户检查 Key | "API Key 无效" |
| L2-认证 | 账户余额不足 (429-billing) | 标记 "quota_exhausted" | 用户充值 | "API 余额不足" |
| L3-模型 | 模型不存在 (404 model not found) | 标记 "model_not_found" | 用户检查可用模型 | "模型未找到，请检查模型名称" |
| L3-模型 | Ollama 模型未拉取 | 标记 "model_not_pulled" | 引导用户 ollama pull | "模型未下载，请执行: ollama pull {model}" |
| L4-响应 | JSON 解析失败 | 尝试从非 JSON 响应中提取文本 | 返回原始文本 | "响应格式异常，已提取可用内容" |
| L4-响应 | 空响应 (LLM 未返回内容) | 标记 "empty_response" | 自动重试 1 次 | "AI 未返回翻译结果，正在重试" |

### Ollama 健康检查

```
翻译前自动检查 (仅首次):
  GET http://localhost:11434/api/tags
    → 200: Ollama 运行中，获取可用模型列表
    → 失败: 标记 Ollama 不可用，前端跳过 Ollama 服务
  GET http://localhost:11434/api/show?name={model}
    → 200: 模型已下载
    → 404: 模型未下载，提示用户 ollama pull
```


## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 推理超时 | AI 翻译单独放宽超时 (15s vs 10s) | 避免大模型推理被过早终止 | — |
| Ollama 流式 | 使用 api/generate?stream=true (优化体验) | 用户看到逐字输出，感知延迟 -50% | — |
| 模型缓存 | Ollama 模型常驻内存 (服务端管理) | 后续请求无模型加载开销 | 首次 ~2s (加载)，后续 ~300ms |
| 请求去重 | 同 text+from+to+model 并发请求合并 | AI 服务较贵，去重节省成本 | — |
| 本地 IP | Ollama 请求走 localhost (无网络延迟) | 网络 RTT = 0ms | 总时延仅取决于推理速度 |

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 插件架构与配置
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 翻译流程与并行调度


## 跨平台实现差异

| 功能 | macOS | Windows | Linux |
|------|-------|---------|-------|
| Ollama 默认地址 | `http://localhost:11434` | 同左 | 同左 |
| Ollama 安装方式 | 官方 .dmg / Homebrew (`brew install ollama`) | 官方 .exe 安装包 | 官方 install.sh / 包管理器 |
| Ollama 服务自启 | launchd (brew service start) / 手动运行 | Windows 服务 (安装时可选) | systemd (手动配置) |
| OpenAI TLS 证书验证 | Security.framework (系统 CA) | SChannel (系统 CA) | OpenSSL (ca-certificates 包) |
| API 代理需要 | 系统代理设置自动生效 (fetch 默认行为) | 同左 | 需手动设置环境变量或 Proxy Auto-Config |
| Gemini API 可用性 | 国内需代理 | 同左 | 同左 |
| ChatGLM API | 直接访问 open.bigmodel.cn | 同左 | 同左 |
| AI 服务响应时间 | 网络延迟 + 推理时间 (典型 2-5s) | 同左 | 同左 (Ollama 本地 < 500ms) |

**关联文档**：
- [翻译服务插件实现](./04-prd-task-翻译服务插件实现.md) — 插件架构与配置
- [并行调度](./21-prd-task-并行调度.md) — Promise.allSettled 多服务并行
- 源 PRD：[13-prd-AI翻译服务.md](../../prds/2026-09/13-prd-AI翻译服务.md)