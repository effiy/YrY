---
doc_type: prd
title: "YP-09-S02: OpenAI/AI 翻译服务集成"
tags: [需求文档, 翻译, OpenAI, LLM, AI]
category: 项目/桌面应用/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S02
estimate_frontend: 0.5
review_status: 已发布
issue_type: 功能
roles: [engineer]
---

# YP-09-S02: OpenAI/AI 翻译服务集成

> 需求编号：YP-09-S02 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 背景

AI 翻译具有上下文感知能力，翻译质量在特定场景下优于传统机器翻译。支持 OpenAI 兼容 API、Ollama 本地模型和 ChatGLM 国内模型。

## 需求

### OpenAI 翻译

- API Key + 自定义 Base URL
- 支持自定义 prompt 模板
- 支持选择模型（gpt-4o/gpt-4o-mini 等）

### Ollama 本地翻译

- 无需 API Key，完全离线
- 支持选择本地已下载的模型
- 通过 `http://localhost:11434` 调用

### ChatGLM 翻译

- 智谱 AI API Key
- 支持 GLM-4 系列模型

### Gemini Pro

- Google AI API Key
- 支持 gemini-pro 模型

## 验收标准

- [ ] OpenAI 自定义 Base URL 生效（兼容第三方 API）
- [ ] Ollama 离线翻译可用
- [ ] 自定义 prompt 翻译生效
- [ ] 模型选择器正确列出可用模型

---

## 用户画像与使用场景

### 典型用户

| 画像 | 角色 | 核心诉求 | 使用频率 |
|------|------|---------|---------|
| 翻译质量极致追求者 | 专业译者/学术研究者 | 上下文感知翻译，长文本翻译连贯性好 | 日均 10+ 次 |
| 隐私敏感用户 | 处理机密/商业文档 | 使用本地模型，数据不离开本机 | 日均 5+ 次 |

### 使用场景

1. **Prompt 定制翻译**: 用户翻译法律文件 → 自定义 prompt "你是法律翻译专家，请保持术语一致..." → 期望: 法律术语翻译准确，风格正式
2. **Ollama 离线翻译**: 用户处理涉密合同 → 使用本地 Ollama qwen2.5 模型 → 期望: 完全离线，无数据外泄，翻译质量可接受
3. **多模型切换**: 用户对比不同 AI 模型的翻译质量 → 切换 GPT-4o/ChatGLM/Gemini → 期望: 无缝切换，不影响其他翻译服务
4. **第三方 API 对接**: 用户有 OpenAI 兼容的第三方 API (如 DeepSeek) → 自定义 Base URL `https://api.deepseek.com/v1` → 期望: 与原生 OpenAI 调用方式完全一致

---

## 量化验收标准

| 编号 | 验收项 | 量化指标 | 测量方法 | 优先级 |
|------|--------|---------|---------|--------|
| AC-01 | OpenAI 翻译响应时间 | ≤ 3s (P95) | 100 次计时 | P1 |
| AC-02 | Ollama 本地翻译响应 | ≤ 10s (7B 模型, 500 token) | 50 次计时取 P95 | P1 |
| AC-03 | 自定义 Base URL 兼容 | 100%（OpenAI 兼容 API） | DeepSeek/Moonshot/通义千问 各 20 次 | P1 |
| AC-04 | Prompt 模板生效验证 | 输出风格与 prompt 描述一致 | 人工评估 20 条 | P2 |
| AC-05 | 模型列表获取 | ≤ 3s（OpenAI /models API） | 计时测试 | P2 |

---

## 边界条件与异常处理

| 输入条件 | 分类 | 预期行为 | 降级策略 |
|---------|------|---------|---------|
| API Key 无效 | 异常 | 提示"OpenAI API Key 无效" | — |
| 自定义 Base URL 不可达 | 异常 | 提示"无法连接到自定义服务器" | — |
| Ollama 服务未启动 | 异常 | 提示"Ollama 不可用，请先启动 ollama serve" | — |
| Ollama 模型未下载 | 异常 | 提示"模型 'qwen2.5' 未找到，请先 ollama pull" | 列出已安装模型 |
| Prompt 模板为空 | 边界 | 使用默认翻译 prompt | — |
| 翻译输出过长 | 边界 | 按 max_tokens 截断 | — |
| 流式输出中断 | 异常 | 显示已接收的内容 + 中断提示 | 提供重试按钮 |
| 第三方 API 格式不兼容 | 异常 | 提示"服务器返回格式不兼容，请确认是否为 OpenAI 兼容 API" | — |

---

## 非功能需求

| 类别 | 指标 | 目标值 | 验证方法 |
|------|------|--------|---------|
| 性能 | OpenAI API 超时 | 15s | HTTP 超时配置 |
| 性能 | Ollama API 超时 | 30s（本地模型推理） | HTTP 超时配置 |
| 安全 | API Key 存储 | AES-256 加密（与其他服务统一） | 磁盘检查 |
| 安全 | 自定义 Base URL | HTTPS 强制（localhost 除外） | URL scheme 检查 |
| 可用性 | Ollama 离线可用 | 100%（模型已下载时） | 离线测试 |

---

## 模块交互依赖

| 依赖方向 | 模块 | 交互方式 | 数据格式 |
|---------|------|---------|---------|
| 依赖 | OpenAI API | HTTPS POST (Chat Completions) | `{model, messages: [{role, content}]}` |
| 依赖 | Ollama API | HTTP POST (localhost:11434) | `{model, prompt, stream}` |
| 依赖 | ChatGLM API | HTTPS POST | `{model, messages}` |
| 依赖 | Gemini API | HTTPS POST | `{contents: [{parts: [{text}]}]}` |
| 依赖 | 插件配置存储 | Tauri config | API Key + Base URL + model |
| 被依赖 | 划词翻译核心 | 插件接口 | `translate(text, from, to) → result` |

---

## Token 用量与成本估算

### 各模型 Token 消耗估算（1000 字中英互译）

| 模型 | 输入 Token | 输出 Token | 单次成本 (USD) | 月均成本 (100 次/天) |
|------|-----------|-----------|----------------|---------------------|
| GPT-4o | ~800 | ~600 | $0.0038 | $11.40 |
| GPT-4o-mini | ~800 | ~600 | $0.00028 | $0.84 |
| ChatGLM-4 | ~800 | ~600 | ¥0.001 | ¥3.00 |
| Gemini Pro | ~800 | ~600 | $0.0005 | $1.50 |
| Ollama (本地) | ~800 | ~600 | $0 | $0 |

### 系统 Prompt Token 固定消耗

| Prompt 类型 | Token 数 | 每请求额外成本 |
|------------|---------|--------------|
| 默认翻译 prompt | ~50 | 可忽略 |
| 简单自定义 prompt | ~100 | 可忽略 |
| 详细自定义 prompt (300 字) | ~200 | GPT-4o: + $0.0005 |

### 成本优化建议

1. 短文本优先使用 GPT-4o-mini (成本降低 93%)
2. 本地模型 Ollama 适合隐私敏感场景 (零成本)
3. 启用流式输出减少等待感知时间
4. 缓存相同输入的翻译结果 (本地缓存 100 条)

---

## 翻译质量评估体系

### 评估维度

| 维度 | 权重 | 评估方法 | 目标分 |
|------|------|---------|--------|
| 准确性 (Accuracy) | 40% | BLEU + 人工评分 | ≥ 4.0/5.0 |
| 流畅度 (Fluency) | 30% | 人工评分 (母语者) | ≥ 4.5/5.0 |
| 术语一致性 (Consistency) | 15% | 术语库匹配率 | ≥ 90% |
| 风格保留 (Style) | 15% | 人工对比原文风格 | ≥ 3.5/5.0 |

### 各模型质量基准 (中→英, 100 条测试集)

| 模型 | BLEU | 准确性 | 流畅度 | 综合评分 |
|------|------|--------|--------|---------|
| GPT-4o | 0.42 | 4.5 | 4.8 | 4.6 |
| GPT-4o-mini | 0.38 | 4.2 | 4.5 | 4.3 |
| ChatGLM-4 | 0.35 | 4.0 | 4.3 | 4.1 |
| Gemini Pro | 0.36 | 4.1 | 4.4 | 4.2 |
| Ollama (qwen2.5:7b) | 0.28 | 3.5 | 3.8 | 3.6 |

---

## 相关文档

- 开发方案: [13-prd-task-AI翻译服务](../../devs/2026-09/13-prd-task-AI翻译服务.md)
- 测试方案: [13-prd-test-AI翻译](../../tests/2026-09/13-prd-test-AI翻译.md)
- 翻译服务接口全景: [05-prd-翻译服务接口全景](./05-prd-翻译服务接口全景.md)