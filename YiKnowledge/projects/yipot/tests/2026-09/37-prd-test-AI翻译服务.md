---

doc_type: test
title: "AI 翻译服务 — 测试方案"
status: 已完成
priority: 中
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["13-prd-AI翻译服务"]
source_modules: ["13-prd-task-AI翻译服务"]

type: test
---

# AI 翻译服务 — 测试方案

> **文档职责**：本文档定义 OpenAI 兼容 API、Ollama 本地模型、ChatGLM、Gemini Pro 四个 AI 翻译服务的完整验证方案，覆盖 prompt 模板、模型切换、离线翻译。

---

## 测试分层

| 层级 | 工具 | 覆盖 |
|------|------|------|
| L1 单元 | Vitest | prompt 模板渲染、API 请求拼装、流式输出解析 |
| L2 集成 | Vitest + HTTP mock | OpenAI/Ollama/ChatGLM/Gemini API 请求/响应 |
| L3 E2E | 手动 (真实 API/Ollama) | 完整 AI 翻译链路、第三方 API 兼容、离线翻译 |

---

## 一、OpenAI 翻译核心用例

### TC-AI-01: OpenAI 基本翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置正确的 OpenAI API Key | — |
| 2 | 翻译 "Hello, how are you?" en→zh | AI 翻译结果自然流畅 |
| 3 | 测量 100 次 P95 响应时延 | ≤ 3s |
| 4 | 切换模型为 gpt-4o-mini | 使用新模型翻译正常 |

### TC-AI-02: 自定义 Base URL (第三方兼容)

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 设置 Base URL 为 `https://api.deepseek.com/v1` | — |
| 2 | 配置 DeepSeek API Key | — |
| 3 | 触发翻译 | 翻译正常返回 |
| 4 | 测试 Moonshot API (月之暗面) | 翻译正常 |
| 5 | 测试通义千问 API (阿里) | 翻译正常 |

### TC-AI-03: Stream 流式输出

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 启用 OpenAI 翻译 | 流式输出启用 |
| 2 | 翻译一段长文本 | 翻译结果逐字符显示 |
| 3 | 流式传输中断 (关闭网络) | 显示已接收内容 + "输出中断"提示 |
| 4 | 点击重试 | 重新发起翻译请求 |

### TC-AI-04: 自定义 Prompt 模板

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 设置 Prompt 模板 "你是法律翻译专家，请保持法律术语一致性..." | — |
| 2 | 翻译法律条款文本 | 术语翻译准确、风格正式 |
| 3 | 切换 Prompt 为 "请用口语化风格翻译" | 翻译结果风格变为口语化 |
| 4 | 清空 Prompt | 使用默认翻译 prompt |

### TC-AI-05: 模型列表获取

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置有效 OpenAI API Key | — |
| 2 | 打开模型选择器 | ≤ 3s 获取模型列表 |
| 3 | 检查列表 | 包含 gpt-4o/gpt-4o-mini 等 |
| 4 | 自定义 Base URL (第三方) | 列出第三方可用模型 |

---

## 二、Ollama 本地翻译用例

### TC-LLM-01: Ollama 本地翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 确保 Ollama 运行 (`ollama serve`) | — |
| 2 | 确保 qwen2.5 模型已下载 | — |
| 3 | 选择 Ollama 翻译服务 (无需 API Key) | — |
| 4 | 翻译一段文本 | 本地模型翻译正常返回 |
| 5 | 测量 P95 响应时延 (7B 500 token) | ≤ 10s |

### TC-LLM-02: Ollama 离线翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 断开网络连接 | — |
| 2 | Ollama 本地运行中 | — |
| 3 | 触发翻译 | 完全离线翻译，无数据外泄 |
| 4 | 抓包检查 | 翻译时无网络请求发出 |

### TC-LLM-03: Ollama 模型未下载

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 删除 qwen2.5 模型 (`ollama rm qwen2.5`) | — |
| 2 | 选择 Ollama 翻译服务 | 提示"模型未找到，请先 ollama pull" |
| 3 | 检查已安装模型列表 | 列出所有可用模型供选择 |

### TC-LLM-04: Ollama 服务未启动

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 停止 Ollama (`pkill ollama`) | — |
| 2 | 尝试使用 Ollama 翻译 | 提示"Ollama 不可用，请先启动 ollama serve" |
| 3 | 启动 Ollama 后重试 | 翻译正常 |

---

## 三、ChatGLM / Gemini Pro 用例

### TC-GLM-01: ChatGLM 翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置智谱 AI API Key | — |
| 2 | 选择 GLM-4 模型 | — |
| 3 | 触发翻译 | 翻译正常返回，中文表达自然 |
| 4 | 翻译专业文本 | 专业术语识别正确 |

### TC-GEMINI-01: Gemini Pro 翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置 Google AI API Key | — |
| 2 | 选择 gemini-pro 模型 | — |
| 3 | 触发翻译 | 翻译正常返回 |
| 4 | 翻译多语言混合文本 | 正确识别各语言并翻译 |

---

## 四、边界与异常测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | OpenAI API Key 无效 | 使用随机字符串 | 提示"OpenAI API Key 无效" | 更正 Key 后重试 |
| TC-ERR-02 | 自定义 Base URL 不可达 | 使用 `http://invalid.local/v1` | 提示"无法连接到自定义服务器" | 修正 URL 后可用 |
| TC-ERR-03 | Ollama 服务未启动 | 关闭 ollama 进程 | 提示"请先启动 ollama serve" | 启动后重试 |
| TC-ERR-04 | Ollama 模型未下载 | 删除本地模型 | 提示模型未找到，列出已安装模型 | pull 后可用 |
| TC-ERR-05 | Prompt 模板为空 | 清空模板 | 使用默认翻译 prompt | — |
| TC-ERR-06 | 输出超长 (超过 max_tokens) | 翻译极长文本 | 按 max_tokens 截断 | — |
| TC-ERR-07 | 流式输出中断 | 输出中关闭网络 | 显示已接收内容 + 中断提示 + 重试按钮 | 重试正常 |
| TC-ERR-08 | 第三方 API 格式不兼容 | 使用非 OpenAI 兼容 API | 提示"服务器返回格式不兼容，请确认是否为 OpenAI 兼容 API" | — |

---

## 五、性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | OpenAI 翻译 P95 | API 到结果展示 | ≤ 3s | > 5s | 100 次计时 |
| TC-PERF-02 | Ollama 本地翻译 P95 (7B, 500 token) | 本地推理 | ≤ 10s | > 15s | 50 次计时 |
| TC-PERF-03 | 模型列表获取 | /models API | ≤ 3s | > 5s | 计时测试 |
| TC-PERF-04 | 自定义 Base URL 兼容 | 各第三方 API | 100% 兼容 | < 95% | DeepSeek/Moonshot/通义千问 各 20 次 |
| TC-PERF-05 | OpenAI API 超时阈值 | HTTP timeout | 15s | — | 超时配置检查 |
| TC-PERF-06 | Ollama API 超时阈值 | HTTP timeout | 30s | — | 超时配置检查 |

---

## 六、安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | API Key AES-256 加密 | 检查配置文件 | 无明文 Key | P0 |
| TC-SEC-02 | Ollama 离线无数据外泄 | 离线 + 抓包 | 无网络请求 | P0 |
| TC-SEC-03 | 自定义 Base URL HTTPS 强制 (非 localhost) | URL scheme 检查 | 禁止 http:// 外部 URL | P1 |
| TC-SEC-04 | Prompt 模板不泄漏 | 翻译敏感文本 + 检查 API 请求 | prompt 不包含用户原文敏感信息 | P1 |

---

## 七、回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 自动化 | 优先级 |
|------|---------|---------|--------|--------|
| REG-01 | OpenAI 基本翻译 | OpenAI API | 否 | P1 |
| REG-02 | Ollama 本地翻译 (离线) | 本地 LLM | 否 | P1 |
| REG-03 | 自定义 Base URL (DeepSeek) | 第三方兼容 | 否 | P1 |
| REG-04 | 自定义 Prompt 模板 | Prompt 工程 | 否 | P2 |
| REG-05 | 流式输出 + 中断重试 | 交互体验 | 否 | P2 |
| REG-06 | API Key 加密存储 | 安全 | 否 | P0 |

---

## 参考文档

- [AI 翻译服务 PRD](../../prds/2026-09/13-prd-AI翻译服务.md)
- [翻译服务接口全景 PRD](../../prds/2026-09/05-prd-翻译服务接口全景.md)