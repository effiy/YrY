---

doc_type: test
title: "Google/DeepL 翻译 — 测试方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["20-prd-DeepL翻译", "21-prd-Google翻译"]
source_modules: ["15-prd-task-DeepL翻译", "16-prd-task-Google翻译"]

type: test
---

# Google/DeepL 翻译 — 测试方案

## Google 翻译

### TC-GG-001: 基本翻译

| 步骤 | 启用 Google → 翻译 "Hello" en→zh |
| 预期 | 返回中文翻译，无需 API Key |

### TC-GG-002: 自动语言检测

| 步骤 | 翻译日语文本 (未指定源语言) |
| 预期 | 自动检测为日语，正确翻译 |

## DeepL 翻译

### TC-DL-001: Free API

| 步骤 | 配置 Free API Key → 翻译 en→de |
| 预期 | 返回德语翻译 |

### TC-DL-002: Pro API

| 步骤 | 配置 Pro API Key → 翻译 |
| 预期 | 使用 Pro endpoint |

### TC-DL-003: formality 参数

| 步骤 | 设置 formality=prefer_more → 翻译 |
| 预期 | 翻译结果使用正式语体 |

### TC-DL-004: HTML 保留

| 步骤 | 翻译含 `<p>` 标签的文本 |
| 预期 | HTML 标签保留在结果中 |

## 边界测试

### TC-GG-E01: 空文本 → 不发起请求
### TC-GG-E02: 超长文本（5000+）→ 截断提示
### TC-DL-E01: 空 API Key → 提示输入

---

## 增强边界与异常测试

### 边界值测试

| 编号 | 测试项 | 输入/场景 | 预期结果 | 优先级 |
|------|--------|----------|---------|--------|
| TC-EDGE-01 | Google 空文本 | 空字符串 "" | 前端拦截，不发起请求 | P1 |
| TC-EDGE-02 | Google 超长文本 | 6000+ 字符 | 截断或返回长度限制错误 | P1 |
| TC-EDGE-03 | Google 不支持语言对 | 中文→冰岛语 | 显示"不支持的语言方向"或回退 | P2 |
| TC-EDGE-04 | DeepL Free API 字符配额耗尽 | 翻译超过 500000 字符/月 | 显示"配额已用完，请升级或等待重置" | P1 |
| TC-EDGE-05 | DeepL formality 参数与语言组合 | formality=prefer_more + en→zh | 中文无 formality 概念，参数被忽略 | P2 |
| TC-EDGE-06 | DeepL HTML 含 script 标签 | `<script>alert(1)</script>Hello` | 保留标签结构，仅翻译文本内容 | P1 |
| TC-EDGE-07 | Google TTS 语音朗读 | 翻译后点击朗读按钮 | 调用 Google TTS，正确发音 | P2 |
| TC-EDGE-08 | DeepL Pro vs Free endpoint 切换 | 从 Free Key 切换为 Pro Key | 自动切换到 `api.deepl.com` (Pro endpoint) | P2 |

### 异常场景测试

| 编号 | 异常场景 | 模拟方式 | 预期行为 | 恢复验证 |
|------|---------|---------|---------|---------|
| TC-ERR-01 | Google 翻译被墙/不可达 | 切断 translate.googleapis.com | 显示"Google 翻译不可用，请检查网络" | 网络恢复后正常 |
| TC-ERR-02 | Google 频率限制 (429) | 短时间内 100+ 请求 | 显示"请求过于频繁"，自动退避 | 冷却期后恢复 |
| TC-ERR-03 | DeepL API Key 无效 | 使用伪造的 Key | 显示"API Key 无效 (403)" | 更换有效 Key 后正常 |
| TC-ERR-04 | DeepL Pro Key 用于 Free endpoint | Free endpoint + Pro Key | 明确提示 endpoint 与 Key 类型不匹配 | 切换 endpoint 后正常 |
| TC-ERR-05 | Google 返回非标准响应 | Mock 非 JSON 响应 | 显示"解析翻译结果失败" | 不影响其他服务 |
| TC-ERR-06 | DeepL 语种检测失败 | 输入极短无意义文本 "ZXQ" | 返回检测结果或提示无法识别语言 | — |
| TC-ERR-07 | Google 网络超时 | Mock 超时无响应 | 显示超时提示，不阻塞并行服务 | 网络恢复后正常 |

## 性能基准测试

| 编号 | 测试场景 | 测量指标 | 基准值 | 劣化阈值 | 测试方法 |
|------|---------|---------|--------|---------|---------|
| TC-PERF-01 | Google 翻译 (简短) | P50/P95/P99 | ≤ 200/500/1000ms | > 400/1000/2000ms | 100 次采样 |
| TC-PERF-02 | Google 自动语言检测 | P50/P95 | ≤ 300/600ms | > 600/1200ms | 50 次采样 |
| TC-PERF-03 | DeepL Free 翻译 | P50/P95 | ≤ 300/800ms | > 600/1600ms | 50 次采样 |
| TC-PERF-04 | DeepL Pro 翻译 | P50/P95 | ≤ 200/500ms | > 400/1000ms | 50 次采样 |
| TC-PERF-05 | DeepL HTML 翻译 (保留标签) | P95 | ≤ 1s | > 2s | 20 次含 HTML 文本 |

## 安全测试

| 编号 | 测试项 | 测试方法 | 预期结果 | 优先级 |
|------|--------|---------|---------|--------|
| TC-SEC-01 | DeepL API Key 加密存储 | 检查配置存储 | 不以明文存储 | P0 |
| TC-SEC-02 | Google 翻译内容不记录日志 | 翻译敏感文本后检查日志 | 日志不含原文和译文 | P1 |
| TC-SEC-03 | DeepL Pro endpoint HTTPS 强制 | 配置 HTTP endpoint | 强制使用 HTTPS 或提示安全风险 | P1 |
| TC-SEC-04 | Google 翻译请求 HTTPS | 抓包检查 Google 翻译请求 | 使用 HTTPS 而非 HTTP | P0 |
| TC-SEC-05 | DeepL vs Google 数据隔离 | 翻译时检查请求目标 | 文本仅发送到当前选择的服务 API | P1 |

## 回归测试清单

| 编号 | 回归用例 | 覆盖功能 | 优先级 |
|------|---------|---------|--------|
| REG-01 | Google 基本翻译 (免 Key) | Google 核心 | P0 |
| REG-02 | Google 自动语言检测 | 语种检测 | P1 |
| REG-03 | DeepL Free API 翻译 | DeepL 核心 | P0 |
| REG-04 | DeepL Pro API 翻译 | DeepL Pro | P1 |
| REG-05 | DeepL formality 参数生效 | 高级参数 | P2 |
| REG-06 | 多接口并行含 Google + DeepL | 并行调度 | P0 |

## 参考文档

- [Google 翻译 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/21-prd-Google翻译.md)
- [DeepL 翻译 PRD](../../../../../YiKnowledge/projects/yipot/prds/2026-09/20-prd-DeepL翻译.md)
- [翻译服务接口测试](004-prd-test-翻译服务接口.md)