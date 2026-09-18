---
doc_type: test
title: "YA-08-02: Multi-Provider LLM — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-02"
source_prds: ["02-需求-Multi-Provider-LLM"]
source_modules: ["02-prd-task-Multi-Provider-LLM"]
source_okr: [yiai-002]
---

# YA-08-02: Multi-Provider LLM — 测试规格

> 来源 PRD：[02-需求-Multi-Provider-LLM.md](../../prds/2026-08/02-需求-Multi-Provider-LLM.md)
> 开发方案：[02-prd-task-Multi-Provider-LLM.md](../../devs/2026-08/02-prd-task-Multi-Provider-LLM.md)
> 需求编号：YA-08-02 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Provider 抽象、Ollama/DeepSeek 双 Provider、配置切换、上下文压缩。

---

## 一、测试范围

| 组件 | 测试重点 |
|------|---------|
| LLMProvider ABC | 接口契约、子类必须实现 `chat()`/`chat_stream()` |
| OllamaProvider | 向后兼容、`ollama.Client` 调用 |
| DeepSeekProvider | HTTP + SSE 解析、OpenAI 格式兼容 |
| 配置切换 | 运行时切换、环境变量读取 |
| 上下文压缩 | token 计数、超窗口触发摘要 |

---

## 二、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-MP-01 | ABC 不可直接实例化 | `LLMProvider()` | TypeError |
| UT-MP-02 | 子类未实现 chat() | Provider 仅实现 `chat_stream` | TypeError（ABC 强制约束） |
| UT-MP-03 | OllamaProvider.chat() | `messages=[{role:"user", content:"hi"}]` | 返回非空字符串 |
| UT-MP-04 | OllamaProvider 向后兼容 | 现有 chat 测试全部通过 | 76 个 pytest 无回归 |
| UT-MP-05 | DeepSeekProvider.chat() | mock DeepSeek API 响应 | 返回格式化响应 |
| UT-MP-06 | DeepSeek SSE 解析 | SSE 事件 `data: {"choices":[{"delta":{"content":"你好"}}]}` | `chat_stream` yield "你好" |
| UT-MP-07 | 配置切换 ollama→deepseek | 修改 `llm.provider` 配置 | 下次请求使用新 Provider |
| UT-MP-08 | API Key 从环境变量读取 | `os.environ["DEEPSEEK_API_KEY"]="sk-xxx"` | Provider 读取到正确 Key |
| UT-MP-09 | Provider 异常处理 | Ollama 不可用 | 抛 `ProviderUnavailableError`（非裸 RuntimeError） |
| UT-CP-01 | 上下文未超窗口 | token 数 < 80% 窗口 | 不触发压缩 |
| UT-CP-02 | 上下文超窗口 | token 数 > 80% 窗口 | 触发压缩，返回摘要后的消息列表 |

---

## 三、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-MP-01 | OllamaProvider 端到端（真实 Ollama） | 查询 "hello" → 返回非空响应 |
| IT-MP-02 | Provider 切换不中断进行中的流 | 流式输出中 → 切换配置 → 当前流不受影响 → 新请求使用新 Provider |
| IT-MP-03 | 长对话上下文压缩 | 20 轮对话 → 超窗口 80% → 自动摘要 → 前 18 轮被摘要替代 |

---

## 四、性能测试

| 编号 | 场景 | 目标 |
|------|------|------|
| PT-01 | Provider 实例化（不含模型加载） | < 1ms |
| PT-02 | 上下文压缩（20 轮对话 → 摘要） | < 3s |

---

## 五、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | Provider 切换导致所有 chat 请求 500 | 配置切换后 Provider 实例化失败 |
| S1 — 严重 | 流式输出格式错误 | SSE 事件不包含 `choices` → 前端解析异常 |
| S2 — 一般 | API Key 未配置时错误提示不明确 | KeyError 而非 "请设置 DEEPSEEK_API_KEY" |
| S3 — 轻微 | 上下文压缩触发过于频繁/保守 |

---

## 六、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| Provider ABC 契约 | ✅ 已完成 | pytest |
| OllamaProvider | ✅ 已完成 | 真实 Ollama 集成测试 |
| DeepSeekProvider | ✅ 已完成 | mock DeepSeek API |
| SSE 解析 | ✅ 已完成 | 流式事件模拟 |
| 上下文压缩 | ✅ 已完成 | mock token 计数 |

---