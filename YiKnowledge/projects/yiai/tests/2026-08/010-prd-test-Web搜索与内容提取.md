---

doc_type: test
title: "Web 搜索与内容提取服务 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-12"
source_prds: ["10-需求-Web搜索与内容提取"]
source_modules: ["10-prd-task-Web搜索与内容提取"]
source_okr: [yiai-003]

type: test
---

# Web 搜索与内容提取服务 — 测试规格

> 来源 PRD：[10-需求-Web搜索与内容提取.md](../../prds/2026-08/10-需求-Web搜索与内容提取.md)
> 开发方案：[10-prd-task-Web搜索与内容提取.md](../../devs/2026-08/10-prd-task-Web搜索与内容提取.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 DuckDuckGo 搜索、Jina Reader + BeautifulSoup 双层内容提取管线、5 分钟缓存、对话压缩。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 外部 HTTP） | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 服务（mock 外部 API） | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `POST /web-search` DuckDuckGo 搜索 | L2 |
| COV-2 | `POST /web-fetch` Jina Reader 优先层 | L2 |
| COV-3 | `POST /web-fetch` BeautifulSoup 降级层 | L2 |
| COV-4 | `web_fetch` 双层管线自动切换 | L2 |
| COV-5 | 5 分钟内存缓存 TTL | L1 |
| COV-6 | `POST /compact` 对话压缩 | L2 |
| COV-7 | 错误结果缓存 | L1 |
| COV-8 | URL 规范化 + 安全检查 | L1 |
| COV-9 | `_extract_text_bs` noise 移除 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_ddg_results` | `[{title: "Result 1", url: "http://example.com/1", snippet: "..."}]` | 模拟 DuckDuckGo 搜索结果 |
| `mock_jina_response` | `"Title: Test Page\n\nMarkdown Content:\n# Hello World\n\nThis is content."` | 模拟 Jina Reader 响应 |
| `sample_html` | 含 `<script>`/`<nav>`/`<footer>` 的完整 HTML 页面 | BeautifulSoup 提取测试 |
| `sample_html_noise` | 含 cookie banner、signup prompt 的 HTML | noise 移除测试 |
| `sample_conversation` | 50 条消息的对话历史 | `/compact` 压缩测试 |

---

## 二、测试用例

### 2.1 DuckDuckGo 搜索（COV-1 . L2）

> 自动化落点：`tests/api/test_search.py`（**待新增**）
> 前置：Mock `duckduckgo_search.DDGS.text`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-001 | 标准搜索返回结果列表 | 1. Mock DDGS.text 返回 3 条结果；2. 调用 `POST /web-search` 带 `{query: "Python FastAPI"}` | 返回 `{code: 0, data: [{title, url, snippet}]}`，数组长度 3 | P0 | 待实现 |
| TC-WEB-002 | 搜索结果最多返回 `max_results` 条 | 1. Mock DDGS.text 返回 10 条结果；2. 请求 `max_results: 6` | 返回最多 6 条结果 | P0 | 待实现 |
| TC-WEB-003 | 搜索结果为空 → 返回空数组 | 1. Mock DDGS.text 返回 `[]`；2. 调用搜索 | 返回 `data: []`，不报错 | P0 | 待实现 |
| TC-WEB-004 | 搜索超时保护（25s） | 1. Mock DDGS.text 延迟 30s；2. 调用搜索设置 25s 超时 | 超时返回错误或空结果，不永久挂起 | P1 | 待实现 |
| TC-WEB-005 | 空查询字符串 → 参数校验 | 1. 调用 `POST /web-search` 带 `{query: ""}` | 返回 `code: 1001`（参数验证失败） | P1 | 待实现 |
| TC-WEB-006 | DuckDuckGo 限流 → 返回空结果 | 1. Mock DDGS.text 抛出 `DuckDuckGoSearchException` | 返回空结果数组或错误，不抛 500 | P1 | 待实现 |

### 2.2 Jina Reader 内容提取（COV-2 . L2）

> 自动化落点：`tests/api/test_search.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-007 | Jina Reader 成功提取 | 1. Mock `https://r.jina.ai/{url}` 返回 Markdown；2. 调用 `POST /web-fetch` | 返回 `{text: "Hello World", url: "http://example.com", source: "jina"}` | P0 | 待实现 |
| TC-WEB-008 | Jina 返回空内容 → 降级到 BS | 1. Mock Jina 返回 `"Markdown Content:\n"`（空）；2. Mock HTTP GET 返回 HTML | 自动降级到 BeautifulSoup，`source = "direct"` | P0 | 待实现 |
| TC-WEB-009 | Jina 返回 "Loading..." → 降级 | 1. Mock Jina 返回 `"Loading..."`；2. Mock HTTP GET 返回 HTML | 自动降级到 BeautifulSoup | P0 | 待实现 |
| TC-WEB-010 | Jina 返回 "Please enable JavaScript" → 降级 | 1. Mock Jina 返回 JS 警告页面 | 自动降级到 BeautifulSoup | P1 | 待实现 |
| TC-WEB-011 | Jina API 超时（10s）→ 降级 | 1. Mock Jina 延迟 15s；2. 设置 10s 超时 | 超时后降级到 BeautifulSoup | P1 | 待实现 |
| TC-WEB-012 | Jina API 返回 4xx/5xx → 降级 | 1. Mock Jina 返回 500 | 降级到 BeautifulSoup | P1 | 待实现 |

### 2.3 BeautifulSoup 降级提取（COV-3 + COV-9 . L1/L2）

> 自动化落点：`tests/unit/domain/test_search.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-013 | BeautifulSoup 提取主内容 | 1. Mock HTTP GET 返回含 `<main>` 标签的 HTML；2. 调用 `_extract_text_bs(html)` | 提取 `<main>` 内文本，不包含 `<script>` 和 `<style>` | P0 | 待实现 |
| TC-WEB-014 | 移除 script/style/nav/footer/header 标签 | 1. 输入含所有 noise 标签的 HTML；2. 提取 | 结果不包含 noise 标签内容 | P0 | 待实现 |
| TC-WEB-015 | 移除 cookie banner + signup prompt | 1. 输入含 `.cookie-banner` 和 `.signup-modal` 的 HTML；2. 提取 | noise selector 内容被移除 | P1 | 待实现 |
| TC-WEB-016 | 内容截断到 8000 字符 | 1. 输入超长内容（15000 字符）；2. 提取 | 输出不超过 8000 字符 | P0 | 待实现 |
| TC-WEB-017 | 非 HTML Content-Type → 拒绝 | 1. Mock HTTP 返回 `Content-Type: application/pdf` | 返回错误，不尝试 BS 解析 | P1 | 待实现 |
| TC-WEB-018 | html2text 转换 Markdown | 1. 输入标准 HTML 页面；2. 提取 | 输出为 Markdown 格式（不含 HTML 标签） | P1 | 待实现 |
| TC-WEB-019 | 折叠 20+ 连续链接 | 1. HTML 含 30 个连续 `<a>` 标签（导航栏）；2. 提取 | 连续链接被折叠（移除或替换为占位符） | P1 | 待实现 |

### 2.4 缓存机制（COV-5 + COV-7 . L1）

> 自动化落点：`tests/unit/domain/test_search.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-020 | 缓存命中 5 分钟内直接返回 | 1. 首次调用 `web_fetch(url)` 缓存结果；2. 30 秒内再次调用同一 URL | 第二次不发起 HTTP 请求，直接返回缓存 | P0 | 待实现 |
| TC-WEB-021 | 缓存过期后重新请求 | 1. 缓存结果 5 分钟；2. 6 分钟后调用同一 URL | 发起新的 HTTP 请求（非缓存） | P0 | 待实现 |
| TC-WEB-022 | 错误结果也缓存 | 1. 首次 `web_fetch` 返回 404 错误；2. 1 分钟内再次调用 | 返回缓存的错误结果，不重复请求 | P1 | 待实现 |
| TC-WEB-023 | `clear_cache()` 清除所有缓存 | 1. 缓存 3 个 URL 结果；2. 调用 `clear_cache()`；3. 再次请求 | 缓存全部清除，重新发起请求 | P1 | 待实现 |

### 2.5 对话压缩（COV-6 . L2）

> 自动化落点：`tests/api/test_search.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-024 | 压缩对话保留最近 4 条 | 1. 输入 50 条消息的对话；2. 调用 `POST /compact` 带 `{messages: [...], keep_last: 4}` | 返回 `{messages: [...], original_count: 50, compacted_count: 4}` | P0 | 待实现 |
| TC-WEB-025 | keep_last 为 0 → 全部压缩 | 1. 输入 10 条消息，`keep_last: 0` | 返回 `compacted_count: 0` | P1 | 待实现 |
| TC-WEB-026 | 消息数少于 keep_last → 不压缩 | 1. 输入 3 条消息，`keep_last: 4` | 返回原消息列表不变，`compacted_count: 3` | P1 | 待实现 |

### 2.6 URL 安全（COV-8 . L1）

> 自动化落点：`tests/unit/domain/test_search.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-027 | URL 规范化补全协议 | 1. 输入 `example.com`；2. `_normalize_url` | 返回 `https://example.com` | P1 | 待实现 |
| TC-WEB-028 | 拒绝内网 IP（127.0.0.1） | 1. 输入 `http://127.0.0.1:8080/admin` | 返回错误（SSRF 防护） | P0 | 待实现 |
| TC-WEB-029 | 拒绝 `file://` 协议 | 1. 输入 `file:///etc/passwd` | 返回错误 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-WEB-EDGE-001 | 特大 HTML（> 512KB） | 1. Mock HTTP 返回 600KB HTML | 超过 `_FETCH_MAX_BYTES` 512KB 限制，截断或拒绝 | P1 | 待实现 |
| TC-WEB-EDGE-002 | HTML 无任何主内容标签 | 1. 输入仅有 `<div>` 的 HTML，无 `<main>`/`<article>` | 退回到 `<body>` 提取 | P2 | 待实现 |
| TC-WEB-EDGE-003 | 非英文（中文/日文）页面 | 1. 输入中文 HTML 页面；2. 提取 | 正确提取中文内容，编码无误 | P1 | 待实现 |
| TC-WEB-EDGE-004 | Jina 和 BS 都失败 → 返回错误 | 1. Mock Jina 失败 + Mock HTTP GET 失败 | 返回错误结果（缓存），不抛 500 | P1 | 待实现 |
| TC-WEB-EDGE-005 | URL 过长（> 2048 字符） | 1. 请求 3000 字符的 URL | 返回参数错误 | P2 | 待实现 |
| TC-WEB-EDGE-006 | 并发 fetch 同一 URL（缓存击穿） | 1. 10 并发调用 `web_fetch(url)` 首次请求 | 仅发起 1 次 HTTP 请求（锁保护），其他等待缓存 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 当前预期 | 优先级 | 状态 |
|------|---------|------|---------|--------|------|
| TC-WEB-REG-001 | 缺陷 2（YA-08-09）：内容提取字符限制混乱 | `_extract_clean_content` 限制 5000，搜索结果 8000 | 内容提取 <= 8000（统一 `_FETCH_OUTPUT_MAX_CHARS`） | P1 | 待实现 |
| TC-WEB-REG-002 | 缺陷 4（YA-08-09）：中文标题 slug 过长 | 超长中文标题的缓存键 | 缓存键长度不超过 255 字节 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 DuckDuckGo 搜索 | 返回 `[{title, url, snippet}]` | TC-WEB-001 ~ 006 |
| FR-02 Jina Reader 提取 | Markdown 内容返回 | TC-WEB-007 ~ 012 |
| FR-03 BeautifulSoup 降级 | Jina 失败时自动切换 | TC-WEB-008 ~ 012 |
| FR-04 双层管线切换 | 自动降级、内容质量判断 | TC-WEB-008 ~ 012 |
| FR-05 5 分钟缓存 | 命中缓存不发起请求 | TC-WEB-020 ~ 023 |
| FR-06 对话压缩 | `/compact` 保留最近 N 条 | TC-WEB-024 ~ 026 |
| FR-07 noise 移除 | 标签 + CSS 选择器 + 链接折叠 | TC-WEB-013 ~ 019 |
| FR-08 SSRF 防护 | 拒绝内网 IP + file:// | TC-WEB-028 ~ 029 |
| FR-09 响应大小限制 | 512KB + 8000 字符 | TC-WEB-016, TC-WEB-EDGE-001 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 真实 Jina Reader API 不可控 | mock 测试无法覆盖 Jina 服务真实行为 | 定期手动回归 |
| G-2 | DuckDuckGo 真实限流策略未知 | mock 无法模拟真实限流频率 | 添加速率限制器并在测试中验证 |
| G-3 | 内存缓存无持久化 | 服务重启后缓存全部丢失 | 可接受（5 分钟 TTL 短），后续考虑 Redis |
| G-4 | JS 渲染页面（SPA）提取效果差 | BS 无法执行 JavaScript | 后续考虑 Puppeteer/Playwright 渲染 |