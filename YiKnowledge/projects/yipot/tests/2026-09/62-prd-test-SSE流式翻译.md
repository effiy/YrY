---

doc_type: module
prd_id: "PO-09-62"
title: "PO-09-62-test: SSE 流式翻译 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-62-test: SSE 流式翻译 — 测试方案

## 测试范围

| 测试项 | 类型 | 验证内容 |
|--------|------|----------|
| SSE 流式连通 | 集成 | openai/ollama 引擎翻译结果逐字显示 |
| 同步保持 | 回归 | google/baidu/deepl 引擎保持原有同步行为 |
| 降级保障 | 容错 | SSE 失败自动降级到直接 API |
| 引擎切换 | 并发 | 翻译中途切换引擎正确处理旧请求 |

## 测试用例

### TC-01: LLM 引擎流式翻译

```
Given: 选择 openai 引擎，输入 "Hello world"
       YiAi 运行，OpenAI API Key 已配置
When: 触发翻译
Then: 翻译结果逐字出现在 textarea 中（非一次性出现）
      最终完整结果与同步翻译一致
```

### TC-02: 传统引擎保持同步

```
Given: 选择 google 引擎，输入 "Hello world"
When: 触发翻译
Then: 翻译结果一次性出现（与改动前行为一致）
      supportsStreaming('google') 返回 false
```

### TC-03: 流式失败降级

```
Given: 选择 ollama 引擎，YiAi streaming 不可用
When: 触发翻译
Then: translateStreamViaYiAi 抛出异常
      catch 分支调用 doTranslate('ollama') 直接 API 翻译
      翻译成功完成
```

### TC-04: 引擎切换丢弃旧请求

```
Given: 使用 openai 引擎翻译长文本（流式中）
When: 切换到 google 引擎
Then: translateID 变化，旧 openai 请求的 setResult 调用被跳过
      仅显示 google 引擎的结果
```

### TC-05: 流式文本完整性

```
Given: 流式翻译 "The quick brown fox jumps over the lazy dog"
When: 接收所有 SSE chunks 并拼接
Then: fullText === "The quick brown fox jumps over the lazy dog"
      无丢失字符或乱码
```

## 测试环境

- YiAi 运行在 localhost:10086
- OpenAI/DeepSeek API Key 已配置
- YiPot 开发模式（`pnpm tauri dev`）