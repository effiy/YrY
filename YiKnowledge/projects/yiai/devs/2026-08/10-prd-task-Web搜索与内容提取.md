---

doc_type: module
prd_task_id: "YA-08-10"
title: "YA-08-10: Web 搜索与内容提取 — Jina Reader + BeautifulSoup 双层管线 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 1.0
source_prd: "10-需求-Web搜索与内容提取.md"
source_okr: [yiai-003]
related_tests: ["10-prd-test-Web搜索与内容提取"]

type: task
---

# YA-08-10: Web 搜索与内容提取 — Jina Reader + BeautifulSoup 双层管线 — 开发方案

> 来源 PRD：[10-需求-Web搜索与内容提取.md](../../prds/2026-08/10-需求-Web搜索与内容提取.md)
> 需求编号：YA-08-10 · 优先级：P1 · 人天：1.0d
> 类型：功能 · 状态：已完成

---

## 一、架构概述

为 YiAi Agent 提供 Web 搜索和内容提取能力。搜索端使用 DuckDuckGo（零 API Key，零成本），内容提取端使用双层管线：Layer 1 为 Jina Reader API（`r.jina.ai`，返回 clean Markdown），Layer 2 为本地 BeautifulSoup + html2text（回退方案）。提取结果缓存在内存中（TTL 5 分钟），载体和代理切换是自动的，调用者无需关心。

```mermaid
graph TD
  subgraph Consumers["消费者"]
    AGENT["Agent 工具系统<br/>web_search / web_fetch"]
    RPC["RPC 端点<br/>POST /web-search<br/>POST /web-fetch<br/>POST /compact"]
  end

  subgraph Search["搜索层 (domain/search/__init__.py 83行)"]
    DDGS["DuckDuckGo 搜索<br/>ddgs.text(query, max_results)<br/>5s 超时 + lru_cache"]
    CACHE_S["内存缓存<br/>@lru_cache(maxsize=32)"]
  end

  subgraph FetchPipeline["内容提取管线 (server/routes/search.py 401行)"]
    NORM["_normalize_url()<br/>URL 规范化"]
    CACHE_F["_fetch_cache (dict)<br/>5min TTL 内存缓存"]
    JINA["Layer 1: Jina Reader<br/>GET r.jina.ai/{url}<br/>→ clean Markdown"]
    BS4["Layer 2: BeautifulSoup<br/>aiohttp GET (15s, 512KB)<br/>→ html2text → Markdown"]
    NOISE["Noise 过滤<br/>script/style/nav/footer<br/>+ 链接列表折叠"]
    TRUNC["截断<br/>8000 字符上限"]
  end

  subgraph Compact["对话压缩"]
    CMP["compact_messages()<br/>保留最近 N 条"]
  end

  AGENT --> RPC
  RPC --> DDGS
  RPC --> NORM
  DDGS --> CACHE_S
  NORM --> CACHE_F
  CACHE_F -- miss --> JINA
  JINA -- 失败/空 --> BS4
  JINA -- 成功 --> TRUNC
  BS4 --> NOISE --> TRUNC
  TRUNC --> CACHE_F

  style FetchPipeline fill:#d4edda,stroke:#28a745
```

### 双层管线决策

| 决策点 | Jina Reader (Layer 1) | BeautifulSoup (Layer 2) |
|--------|----------------------|------------------------|
| 适用场景 | 静态网页、文档站点 | SPA 页面、Jina 不可用时 |
| 输出格式 | Clean Markdown | html2text 转换的 Markdown |
| 外部依赖 | `r.jina.ai` (第三方服务) | `aiohttp` + `BeautifulSoup` + `html2text` (纯本地) |
| JS 渲染 | Jina 服务端渲染 | 无 JS 渲染能力 |
| 延迟 | 2-10s | 1-5s |
| 可靠性 | 依赖外部服务可用性 | 完全可控 |

---

## 二、文件清单

| # | 文件 | 操作 | 说明 | 预估行数 |
|---|------|------|------|----------|
| 1 | `src/domain/search/__init__.py` | 新增 | DuckDuckGo 搜索 + lru_cache 缓存 | ~83 |
| 2 | `src/server/routes/search.py` | 新增 | 搜索/提取/压缩 REST 端点 + 双层管线 | ~401 |
| **合计** | | | | **~484 行** |

### 组件树

```
domain/search/__init__.py (83 行)
├── search(query, max_results=6) → List[{title, url, snippet}]
│   └── DDGS(timeout=5).text(q, max_results)
│         └── DuckDuckGo 内部 API
└── clear_cache() → 清除内存缓存

server/routes/search.py (401 行)
├── 配置常量
│   ├── _FETCH_TIMEOUT = 15.0
│   ├── _FETCH_MAX_BYTES = 512 * 1024 (512KB)
│   ├── _FETCH_OUTPUT_MAX_CHARS = 8000
│   └── _CACHE_TTL_SECONDS = 300 (5min)
│
├── POST /web-search
│   └── asyncio.to_thread(do_search, query, max_results)
│         └── 25s 超时保护
│
├── POST /web-fetch
│   ├── URL 规范化 (_normalize_url)
│   ├── 缓存检查 (5 分钟 TTL)
│   ├── Layer 1: _fetch_via_jina(url)
│   │     └── GET https://r.jina.ai/{url}
│   │           └── 提取 "Markdown Content:" 后的内容
│   ├── Layer 2: 直接 HTTP + BeautifulSoup + html2text
│   │     ├── aiohttp GET (15s 超时, 512KB 限制)
│   │     ├── _extract_text_bs(html)
│   │     │   ├── 移除 noise tags (script/style/nav/footer/header/aside/iframe/form/button)
│   │     │   ├── 移除 noise selectors (cookie banners, GitHub headers, signup prompts)
│   │     │   ├── 定位主内容区 (article → main → [role=main] → .markdown-body → .content → body)
│   │     │   ├── _collapse_link_lists (20+ 连续 <a> → 折叠)
│   │     │   └── html2text 转换 → Markdown
│   │     └── 截断到 8000 字符
│   └── 错误结果也缓存 (避免立即重试)
│
├── POST /compact
│   └── compact_messages(messages, keep_last=4)
│         └── 压缩对话历史，保留最近 N 条
│
└── 辅助函数
    ├── _normalize_url(url) → 规范化 URL (小写 scheme+host, 去除默认端口和尾部斜杠)
    ├── _is_url_allowed(url) → SSRF 防护 (拒绝内网 IP)
    ├── _fetch_via_jina(url) → dict | None
    ├── _fetch_via_direct(url) → dict | None
    ├── _extract_text_bs(html, url) → dict | None
    └── _collapse_link_lists(soup) → 折叠 20+ 连续链接
```

---

## 三、模块设计

### 3.1 DuckDuckGo 搜索 — `domain/search/__init__.py`

```python
from functools import lru_cache
from duckduckgo_search import DDGS
from typing import List, Dict

@lru_cache(maxsize=32)
def search(query: str, max_results: int = 6) -> List[Dict[str, str]]:
    """DuckDuckGo 网页搜索，5s 超时，结果缓存 5 分钟。
    
    返回格式:
      [{title: "结果标题", url: "https://...", snippet: "摘要文本"}, ...]
    
    异常处理:
      - DDGS 连接超时 → 返回空列表 (不抛异常)
      - DuckDuckGo 限流 → 返回空列表
      - 网络不可用 → 返回空列表
    
    设计理由:
      - DuckDuckGo 无需 API Key，零成本，零配额限制
      - lru_cache 对相同查询在 TTL 内返回缓存结果
      - 同步 DDGS 在 asyncio.to_thread 中调用，不阻塞事件循环
    """
    try:
        with DDGS(timeout=5) as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                }
                for r in results
            ]
    except Exception as e:
        logger.warning(f"Search failed for '{query}': {e}")
        return []


def clear_cache() -> None:
    """清除搜索缓存 (search.cache_clear())"""
    search.cache_clear()
```

### 3.2 URL 规范化与安全 — `search.py`

```python
from urllib.parse import urlparse, urlunparse
import ipaddress

def _normalize_url(url: str) -> str:
    """规范化 URL：小写 scheme+host，去除默认端口和尾部斜杠。
    
    示例:
      "HTTPS://Example.COM:443/path/" → "https://example.com/path"
      "http://user:pass@host.com/page?a=1" → "http://host.com/page?a=1"  (凭证移除)
    """
    p = urlparse(url.strip())
    scheme = p.scheme.lower()
    host = p.hostname.lower() if p.hostname else ""
    port = p.port
    # 去除默认端口
    if (scheme == "http" and port == 80) or (scheme == "https" and port == 443):
        port = None
    netloc = f"{host}:{port}" if port else host
    path = p.path.rstrip("/") if p.path != "/" else p.path
    return urlunparse((scheme, netloc, path, p.params, p.query, ""))

def _is_url_allowed(url: str) -> bool:
    """SSRF 防护：拒绝内网地址和非 HTTP 协议。
    
    拒绝:
      - file://、ftp://、gopher:// 等非 http/https 协议
      - 127.0.0.0/8、10.0.0.0/8、172.16.0.0/12、192.168.0.0/16
      - 0.0.0.0、localhost、[::1]
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    hostname = parsed.hostname
    if not hostname:
        return False
    # 拒绝裸主机名 (可能解析为内网)
    if hostname in ("localhost", "0.0.0.0", "::1"):
        return False
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return False
    except ValueError:
        pass  # 非 IP 地址，继续
    return True
```

### 3.3 Jina Reader 层 — `_fetch_via_jina`

```python
_JINA_URL = "https://r.jina.ai/"
_JINA_HEADERS = {
    "Accept": "text/markdown",
    "X-No-Cache": "true",
}

async def _fetch_via_jina(url: str) -> Optional[Dict[str, Any]]:
    """通过 Jina Reader (r.jina.ai) 提取网页内容为 Markdown。
    
    Jina Reader 会对网页进行服务端渲染 → 提取正文 → 返回 clean Markdown。
    对于 SPA/JS 重度网站效果优于 BeautifulSoup。
    
    返回: {text: str, url: str, source: "jina"} | None (失败)
    
    失败条件:
      - HTTP 非 200
      - Content-Type 不是 text/markdown
      - 返回内容 < 100 字符
      - 返回内容含 "Loading..." 或 "Please enable JavaScript"
      - 超时 (> _FETCH_TIMEOUT)
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                _JINA_URL + url,
                headers=_JINA_HEADERS,
                timeout=aiohttp.ClientTimeout(total=_FETCH_TIMEOUT),
            ) as resp:
                if resp.status != 200:
                    return None
                content_type = resp.headers.get("content-type", "")
                if "text/markdown" not in content_type and "text/plain" not in content_type:
                    return None
                text = await resp.text()
                # 质量检查
                if len(text.strip()) < 100:
                    return None
                if any(kw in text[:500] for kw in ("Loading...", "Please enable JavaScript")):
                    return None
                return {
                    "text": text[:_FETCH_OUTPUT_MAX_CHARS],
                    "url": url,
                    "source": "jina",
                }
    except Exception as e:
        logger.warning(f"Jina fetch failed for {url}: {e}")
        return None
```

### 3.4 BeautifulSoup 回退层 — `_extract_text_bs`

```python
from bs4 import BeautifulSoup
import html2text as h2t

# 移除的标签
_NOISE_TAGS = {
    "script", "style", "nav", "footer", "header", "aside",
    "noscript", "iframe", "form", "button", "svg",
}

# 移除的 CSS 选择器
_NOISE_SELECTORS = [
    "[class*='cookie']", "[id*='cookie']",
    "[class*='banner']",
    ".signup-prompt", ".newsletter-signup",
    ".social-share", ".related-posts",
    ".advertisement", ".ads",
    ".header-site", ".site-header",
    ".footer-site", ".site-footer",
]

async def _extract_text_bs(html: str, url: str) -> Optional[Dict[str, Any]]:
    """BeautifulSoup 回退提取：移除噪声 → 定位主内容 → html2text 转换。
    
    定位策略 (按优先级):
      1. <article> 标签
      2. <main> 标签  
      3. [role="main"] 属性
      4. .markdown-body / .content / .post-content / .entry-content 类
      5. <body> 标签
    """
    soup = BeautifulSoup(html, "lxml")
    
    # 1. 移除 noise tags
    for tag in soup(_NOISE_TAGS):
        tag.decompose()
    
    # 2. 移除 noise selectors
    for selector in _NOISE_SELECTORS:
        for el in soup.select(selector):
            el.decompose()
    
    # 3. 定位主内容
    main = (
        soup.find("article")
        or soup.find("main")
        or soup.find(attrs={"role": "main"})
        or soup.select_one(
            ".markdown-body, .content, .post-content, "
            ".entry-content, .article-content, #content"
        )
        or soup.find("body")
    )
    if not main:
        return None
    
    # 4. 折叠长链接列表
    _collapse_link_lists(main)
    
    # 5. html2text 转换
    converter = h2t.HTML2Text()
    converter.ignore_links = False
    converter.ignore_images = True
    converter.body_width = 0  # 不自动换行
    text = converter.handle(str(main))
    
    return {
        "text": text[:_FETCH_OUTPUT_MAX_CHARS],
        "url": url,
        "source": "beautifulsoup",
    }
```

### 3.5 链接列表折叠 — `_collapse_link_lists`

```python
def _collapse_link_lists(soup: BeautifulSoup, threshold: int = 20) -> None:
    """检测并折叠连续的长链接列表。
    
    某些页面 (如 GitHub 语言统计、导航栏) 包含 100+ 个 <a> 标签，
    在 8000 字符预算中占比巨大。折叠后仅保留前 5 个。
    
    条件: 连续 <a> 标签数量 >= threshold，且每个链接文本 < 20 字符
    """
    all_elements = list(soup.descendants)
    i = 0
    while i < len(all_elements):
        if all_elements[i].name == "a":
            # 检查连续链接序列
            link_seq = []
            j = i
            while j < len(all_elements) and all_elements[j].name == "a":
                link_text = all_elements[j].get_text(strip=True)
                if len(link_text) < 20:  # 短链接文本才是导航链接
                    link_seq.append(all_elements[j])
                j += 1
            if len(link_seq) >= threshold:
                # 保留前 5 个
                for el in link_seq[5:]:
                    el.decompose()
                i = j
            else:
                i += 1
        else:
            i += 1
```

### 3.6 缓存管理

```python
_fetch_cache: Dict[str, Tuple[float, dict]] = {}

async def _cached_fetch(url: str) -> dict:
    """带缓存的 URL 内容提取。
    
    缓存策略:
      - Key: 规范化后的 URL
      - TTL: 5 分钟 (成功和错误结果都缓存)
      - 错误缓存: 避免立即重试失败 URL
      - 缓存大小: 无限制 (低频操作, 预计 < 200 条)
    """
    normalized = _normalize_url(url)
    
    # 检查缓存
    if normalized in _fetch_cache:
        ts, data = _fetch_cache[normalized]
        if time.time() - ts < _CACHE_TTL_SECONDS:
            return data
    
    # 双层管线
    result = await _fetch_via_jina(url)
    if result is None:
        result = await _fetch_via_direct(url)
    
    # 缓存 (包括错误结果)
    if result:
        _fetch_cache[normalized] = (time.time(), result)
    else:
        _fetch_cache[normalized] = (time.time(), {
            "error": f"Failed to extract content from {url}",
            "url": url,
        })
    
    return _fetch_cache[normalized][1]
```

### 3.7 REST 端点

```python
@router.post("/web-search")
async def web_search(request: Request):
    """DuckDuckGo 搜索端点。
    
    请求: {query: str, max_results?: int (1-10)}
    响应: {code: 0, data: [{title, url, snippet}, ...]}
    
    超时保护: asyncio.wait_for(..., timeout=25)
    """
    body = await request.json()
    query = str(body.get("query", "")).strip()
    if not query:
        return error(1001, "Missing required parameter: query")
    max_results = min(int(body.get("max_results", 6)), 10)
    
    try:
        results = await asyncio.wait_for(
            asyncio.to_thread(search, query, max_results),
            timeout=25.0,
        )
    except asyncio.TimeoutError:
        return error(2002, "Search request timed out")
    
    return success(data=results)


@router.post("/web-fetch")
async def web_fetch(request: Request):
    """URL 内容提取端点。
    
    请求: {url: str}
    响应: {code: 0, data: {text, url, source}}
    
    安全: URL 需通过 _is_url_allowed SSRF 检查
    """
    body = await request.json()
    url = str(body.get("url", "")).strip()
    if not url:
        return error(1001, "Missing required parameter: url")
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    if not _is_url_allowed(url):
        return error(4002, f"Access denied: URL not in allowed domains")
    
    result = await _cached_fetch(url)
    if "error" in result:
        return error(3001, result["error"])
    return success(data=result)


@router.post("/compact")
async def compact(request: Request):
    """对话压缩端点。
    
    请求: {messages: [...], keep_last?: int (default 4)}
    响应: {code: 0, data: {messages, original_count, compacted_count}}
    """
    body = await request.json()
    messages = body.get("messages", [])
    keep_last = min(int(body.get("keep_last", 4)), 20)
    original_count = len(messages)
    compacted = messages[-keep_last:] if len(messages) > keep_last else messages
    return success(data={
        "messages": compacted,
        "original_count": original_count,
        "compacted_count": len(compacted),
    })
```

---

## 四、数据流

### 4.1 内容提取完整流程

```
Agent 工具调用 web_fetch(url="https://example.com/article")
  │
  ▼
POST /web-fetch
  │
  ├── 1. _normalize_url("https://example.com/article")
  │     └── "https://example.com/article"
  │
  ├── 2. _is_url_allowed("https://example.com") → True
  │
  ├── 3. 缓存检查: _fetch_cache["https://example.com/article"]
  │     ├── 命中 (5min 内) → 直接返回
  │     └── 未命中 ↓
  │
  ├── 4. Layer 1: _fetch_via_jina("https://example.com/article")
  │     ├── GET https://r.jina.ai/https://example.com/article
  │     ├── 状态 200 + Content-Type: text/markdown
  │     └── 提取内容 > 100 字符 → {text: "# Article\n...", source: "jina"}
  │           └── 缓存 + 返回
  │
  │     OR (Jina 失败)
  │     └── Layer 2: _fetch_via_direct("https://example.com/article")
  │           ├── aiohttp GET (15s 超时, 512KB 限制)
  │           ├── Content-Type: text/html
  │           ├── BeautifulSoup 解析
  │           ├── 移除 noise (script/style/nav/footer/...)
  │           ├── 定位 <article> 主内容
  │           ├── html2text 转换
  │           ├── 截断到 8000 字符
  │           └── 缓存 + 返回
  │
  └── 响应: {code: 0, data: {text: "...", url: "...", source: "jina"}}
```

---

## 五、实施路线图

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | DuckDuckGo 搜索集成 | `domain/search/__init__.py` | `search("Python asyncio")` 返回 6 条结果 | 0.15 |
| 2 | Jina Reader 层实现 | `server/routes/search.py` (`_fetch_via_jina`) | 静态网页 URL → clean Markdown 提取成功 | 0.20 |
| 3 | BeautifulSoup 回退层 + Noise 过滤 | `server/routes/search.py` (`_extract_text_bs`) | Jina 失败时自动回退，noise 标签被移除 | 0.25 |
| 4 | 缓存管理 + URL 安全 | `server/routes/search.py` (`_cached_fetch`, `_is_url_allowed`) | 相同 URL 5min 内命中缓存，内网 URL 被拒绝 | 0.15 |
| 5 | REST 端点 + 对话压缩 | `server/routes/search.py` (路由定义) | POST /web-search、/web-fetch、/compact 均可正常调用 | 0.15 |
| 6 | 测试 + 异常边界 | `tests/` | 双层管线切换、超时保护、SSRF 拒绝 | 0.10 |
| **合计** | | | | **1.0d** |

---

## 六、代码审查检查清单

- [ ] DuckDuckGo 搜索有 5s 超时保护（`DDGS(timeout=5)`）
- [ ] `/web-search` 使用 `asyncio.to_thread` 避免阻塞事件循环
- [ ] `/web-search` 有 25s 外层超时保护
- [ ] Jina Reader 失败时自动回退到 BeautifulSoup（不抛异常）
- [ ] Jina Reader 内容质量检查（> 100 字符, 无 "Loading..."/"Please enable JavaScript"）
- [ ] BeautifulSoup 提取移除 10 种 noise tags + 6 类 noise selectors
- [ ] BeautifulSoup 内容定位器按优先级：article → main → [role=main] → .markdown-body → body
- [ ] 内容截断到 8000 字符
- [ ] 缓存 TTL 5 分钟，包含成功和错误结果
- [ ] HTTP 响应超过 512KB 时截断
- [ ] `_collapse_link_lists` 正确检测 20+ 连续 `<a>` 标签，仅折叠短链接文本（< 20 字符）
- [ ] `_is_url_allowed` SSRF 防护拒绝内网 IP、localhost、非 http/https 协议
- [ ] `_normalize_url` 去除默认端口（80/443）、凭证信息、尾部斜杠
- [ ] `ruff` 代码规范通过

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|---------|---------|
| DuckDuckGo 搜索被限流 | 中 | 中 | 中 | 5s 超时、lru_cache 缓存、返回空列表而非异常 | 切换至 Google/Bing Search API |
| Jina Reader 服务不可用 | 低 | 低 | 低 | 自动回退 Layer 2 BeautifulSoup | 仅使用 BeautifulSoup |
| SPA 页面内容提取为空 | 中 | 中 | 中 | Jina Reader 对 SPA 友好；BeautifulSoup 通过 `<noscript>` 提取基本信息 | 返回搜索结果摘要而非空白 |
| 大文件提取 OOM | 低 | 中 | 低 | 512KB 响应限制 + 8000 字符截断 | 降低限制至 256KB/4000 字符 |
| 内存缓存无限增长 | 低 | 低 | 低 | 低频操作 (日均 < 500 次)，无持久化 | 超过 1000 条时 LRU 淘汰 |
| SSRF 绕过 | 低 | 高 | 中 | `_is_url_allowed` 拒绝内网 IP；DNS rebinding 防护 | 启用 URL 白名单模式 |

---

## 八、已知缺陷与技术债务

### 8.1 重构后发现的回归问题

| # | 问题 | 根因 | 修复方式 |
|---|------|------|---------|
| 1 | Jina Reader 对 JS 渲染 SPA 返回空内容 | Jina headless browser 渲染超时 | BeautifulSoup 回退层从 `<noscript>` 提取基本信息 |
| 2 | `_NOISE_TAGS` 误删 `<article>` 内的 `<header>` | 一刀切移除所有 `<header>` | 保留 `<article>` 内的 `<header>`，仅移除页面级 |
| 3 | URL 缓存忽略 query string 差异 | `_normalize_url` 未保留 query | 缓存 key 包含完整 query string |
| 4 | DuckDuckGo 企业网络 DNS 解析失败 | DDGS 默认连接 `duckduckgo.com` | 搜索超时后返回 `[]` 优雅降级 |

### 8.2 技术债务

| # | 技术债 | 优先级 | 预计人天 | 说明 |
|---|--------|--------|---------|------|
| 1 | 搜索引擎多源支持 | P2 | 1.0 | 补充 Google/Bing/Brave Search API |
| 2 | 搜索结果缓存 | P2 | 0.5 | 相同查询 TTL 内复用结果 |
| 3 | 内容提取质量评分 | P3 | 0.5 | 自动评分（完整性、可读性），低质量降级为摘要 |
| 4 | 图片 OCR 提取 | P3 | 1.0 | 扩展 `_extract_refs_from_value` 支持图片 OCR |
| 5 | 搜索历史与个性化 | P3 | 0.5 | 记录搜索历史，提质排序 |

---

## 九、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|----------|------|
| 搜索成功率 | 成功次数 / 总搜索次数 | < 90% | DuckDuckGo 限流或网络问题 |
| Jina Reader 可用率 | Jina 成功次数 / 总提取次数 | < 80% | Jina 服务不稳定 |
| BeautifulSoup 回退比例 | 回退次数 / 总提取次数 | > 50% | Jina 大面积不可用 |
| 内容提取延迟 P95 | `time.perf_counter()` 前后差值 | > 10s | 双层管线总耗时过长 |
| 缓存命中率 | 缓存命中 / 总提取次数 | < 20% | 缓存利用率低 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `INFO` | 提取完成 | `[Fetch] {url}: source={s}, chars={n}, {ms}ms` |
| `WARN` | Jina 回退 | `[Fetch] {url}: jina failed, falling back to bs4` |
| `WARN` | 内容截断 | `[Fetch] {url}: truncated from {n1} to {n2} chars` |
| `WARN` | 搜索限流 | `[Search] ddg returned empty for '{query}'` |
| `ERROR` | 提取完全失败 | `[Fetch] {url}: all layers failed` |
| `ERROR` | SSRF 拒绝 | `[Fetch] SSRF blocked: {url}` |

---

## 十、关联模块

- **消费者**：YA-08-13（Agent 工具系统）— `web_search`、`web_fetch` 作为内置 Agent 工具
- **消费者**：YA-07-04（AI 聊天服务）— 搜索结果作为 LLM 上下文注入
- **基础设施**：`aiohttp`（异步 HTTP）、`BeautifulSoup`（HTML 解析）、`html2text`（Markdown 转换）、`duckduckgo_search`（搜索 SDK）