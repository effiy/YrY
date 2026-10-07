---

doc_type: test
title: "DeepL/Google 翻译 — 测试方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
prd_month: "202609"
source_prds: ["20-prd-DeepL翻译", "21-prd-Google翻译"]
source_modules: ["20-prd-task-GoogleDeepL翻译"]

type: test
---

# DeepL/Google 翻译 — 测试方案

| 编号 | 用例 | 预期 |
|------|------|------|
| TC-DL-01 | DeepL Free API | 30+ 语言翻译 |
| TC-DL-02 | DeepL formality | prefer_more 生效 |
| TC-GG-01 | Google 免费翻译 | 无需 API Key |
| TC-GG-02 | Google 语言检测 | en→zh 正确 |

## 边界测试

| 场景 | 预期 |
|------|------|
| DeepL API Key 无效 | 认证失败提示 |
| Google 超长文本 | 正常截断或翻译 |

| 网络完全断开 | 超时提示，不崩溃 | "网络连接失败" |
| 并发 10 个翻译请求 | 逐个处理，不丢结果 | 10 个结果均正确 |
| 特殊 HTML 实体 (`&amp;`) | 不破坏实体 | `&amp;` 原样保留 |
| 极短文本（单个字符） | 正常翻译 | 返回单字符翻译 |
| 语言代码大小写混合 (`EN`, `en`, `En`) | 内部规范化比较 | 正确处理 |
| 响应 JSON 格式异常 | 降级返回原始文本 | "翻译结果解析异常" |
| DeepL Free 字符超限 | 自动分片翻译 | 分片结果正确拼接 |

## 性能基准测试

| 场景 | 测试方法 | 基准 |
|------|----------|------|
| Google 短文本翻译 (10 字) | `fetch` 开始到结果解析完成 | < 500ms |
| DeepL 短文本翻译 (10 字) | `fetch` 开始到结果解析完成 | < 800ms |
| LRU 缓存命中 | 重复翻译同一文本 | < 1ms |
| 语言检测 | API 返回语言检测结果 | < 200ms |
| 长文本分片翻译 (5000 字) | 并行分片 + 拼接总时间 | < 3s |

## 回归测试清单

- [ ] Google 免费接口 30+ 语言均可翻译
- [ ] DeepL Free `formality` 参数生效
- [ ] API Key 切换后即时生效（无需重启）
- [ ] 网络恢复后重试机制正常
- [ ] AbortController 取消旧请求后新请求正常执行
- [ ] 翻译缓存不影响不同语言对的翻译结果