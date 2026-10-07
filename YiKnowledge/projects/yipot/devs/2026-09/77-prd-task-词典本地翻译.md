---

doc_type: module
prd_task_id: "YP-09-S20"
title: "词典与本地翻译 — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "31-prd-词典与本地翻译.md"

type: task
---

# 词典与本地翻译 — 开发方案

> 来源 PRD：[31-prd-词典与本地翻译.md](../../prds/2026-09/31-prd-词典与本地翻译.md)

## 架构概览

```
用户查询单词 / 短句
      │
      │  query_type: "single_word" ? → 词典模式
      │  query_type: "sentence"     ? → 翻译模式
      ▼
┌───────────────────────────────────────────────────────┐
│            查询路由 (前端 React)                       │
│                                                        │
│  detectQueryType(text): "word" | "sentence"           │
│    │  text 无空格 → word (可能是中文/日文单词)        │
│    │  text 有空格 → sentence                          │
│    │  用户可手动切换                                  │
│    ▼                                                   │
│                                                        │
│  word mode: 激活词典服务链                             │
│    │                                                    │
│    │  ECDICT (本地)  ───────┐                          │
│    │  必应词典 (在线)  ────┤ 并行查询                │
│    │  剑桥词典 (在线)  ────┤                          │
│    │                        ▼                          │
│    │  结果聚合 + 去重                                 │
│    │                                                    │
│  sentence mode: 激活翻译服务链                         │
│    │  百度/Google/Deepl/...                            │
│    │  + Lingva (自托管, 可选)                          │
│    ▼                                                   │
│  展示结果 (单词详情 or 翻译结果)                      │
└───────────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

前端 `services/dictionary/` + `services/translate/lingva/`

### 必应词典 (bing_dict)

```javascript
// services/dictionary/bing.jsx
const BING_DICT_API = "https://cn.bing.com/dict/search";

export async function bingDictLookup(word, lang = "en-zh") {
  const params = new URLSearchParams({ q: word });
  const url = `${BING_DICT_API}?${params}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "text/html",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    });

    const html = await response.text();
    return parseBingDictHtml(html);
  } catch (e) {
    return { error: "必应词典查询失败" };
  }
}

// 解析必应词典 HTML 返回结构化数据
function parseBingDictHtml(html) {
  return {
    phonetic: extractPattern(html, /<span class="hd_pr_us">(.*?)<\/span>/),
    definitions: extractPatterns(html, /<span class="pos">(.*?)<\/span>/),
    examples: extractPatterns(html, /<span class="sen_en">(.*?)<\/span>/),
    source: "bing",
  };
}
```

**返回字段**：音标 (英/美)、词性、释义、例句、同义词、发音音频 URL

### 剑桥词典 (cambridge_dict)

```javascript
// services/dictionary/cambridge.jsx
const CAMBRIDGE_API = "https://dictionary.cambridge.org/dictionary/english";

export async function cambridgeLookup(word) {
  try {
    const response = await fetch(`${CAMBRIDGE_API}/${encodeURIComponent(word)}`);
    const html = await response.text();

    return {
      phonetic: extractCambridgePhonetic(html),
      definitions: extractCambridgeDefs(html),
      examples: extractCambridgeExamples(html),
      level: extractCambridgeLevel(html),  // A1/A2/B1/B2/C1/C2
      source: "cambridge",
    };
  } catch (e) {
    return { error: "剑桥词典查询失败" };
  }
}
```

**特点**：英英释义，CEFR 等级标注 (A1-C2)，适合英语学习者。

### ECDICT 本地词典

```javascript
// services/dictionary/ecdict.jsx
// ECDICT 为离线 SQLite 词库，通过 WebAssembly SQLite 在前端查询
import initSqlJs from "sql.js";

let db = null;

async function initEcdict() {
  if (db) return db;
  const SQL = await initSqlJs({
    locateFile: (file) => `/ecdict/${file}`,
  });
  // 加载预下载的词库文件
  const response = await fetch("/ecdict/ecdict.sqlite");
  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));
  return db;
}

export async function ecdictLookup(word) {
  try {
    const database = await initEcdict();
    const stmt = database.prepare(
      "SELECT * FROM words WHERE word = ? COLLATE NOCASE"
    );
    stmt.bind([word]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      return {
        word: row.word,
        phonetic: row.phonetic,
        definitions: parseEcdictDefinition(row.definition),
        translations: parseEcdictTranslation(row.translation),
        tags: row.tag,
        source: "ecdict",
      };
    }
    return { error: "未找到该词" };
  } catch (e) {
    return { error: "离线词库未加载，请先下载词库" };
  }
}
```

**特点**：完全离线，SQLite 词库 ~100MB，需首次下载。支持 770 万词条。

### Lingva 自托管翻译

```javascript
// services/translate/lingva.jsx
export default async function lingvaTranslate(text, options = {}) {
  const { from = "auto", to = "zh", server = "https://lingva.ml" } = options;

  try {
    const response = await fetch(
      `${server}/api/v1/${from}/${to}/${encodeURIComponent(text)}`
    );
    const data = await response.json();

    return {
      translation: data.translation,
      source: "lingva",
      server: server,
    };
  } catch (e) {
    // 自托管服务器不可达 → 静默降级到其他翻译服务
    throw new Error(`Lingva 服务器不可达: ${server}`);
  }
}
```

**特点**：开源 (GitHub: thedaviddelta/lingva-translate)，支持 Docker 私有化部署，无 API Key，隐私友好。

### 结果聚合与展示

```javascript
// services/dictionary/index.jsx
export async function lookupWord(word, lang = "en-zh") {
  // 并行查询所有词典服务
  const [bing, cambridge, ecdict] = await Promise.allSettled([
    bingDictLookup(word, lang),
    cambridgeLookup(word),
    ecdictLookup(word),
  ]);

  return {
    word,
    results: [
      bing.status === "fulfilled" ? bing.value : null,
      cambridge.status === "fulfilled" ? cambridge.value : null,
      ecdict.status === "fulfilled" ? ecdict.value : null,
    ].filter(Boolean),

    // 聚合推荐：取第一个成功的结果
    primary: [ecdict, bing, cambridge].find(r => 
      r.status === "fulfilled" && !r.value.error
    )?.value || null,
  };
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 词典/翻译分离 | 单词查询 → 词典，句子 → 翻译 | 统一用翻译 API | 词典提供音标/词性/例句/同义词，翻译 API 无此信息 | 需维护两套服务 |
| ECDICT 存储 | SQL.js (WebAssembly SQLite) | JSON 文件 | SQLite 查询快，770 万词条 JSON 过大 | 首次需下载 ~100MB 词库 |
| 词典查询策略 | 并行查询 3 个词典 → 取第一个成功 | 串行查询 | 并行 → 总延迟 = max(各服务延迟) < 1s | 产生冗余网络请求 |
| Lingva 定位 | 可选自托管翻译，隐私优先 | 强制使用 | 企业内网/隐私场景不可使用公开翻译 API | 需用户自行部署 Lingva (Docker) |
| 必应/剑桥抓取 | HTML 解析 (非官方 API) | — | 两个词典无官方 JSON API，仅提供网页版 | HTML 结构变化会导致解析失败 |
| Word/Sentence 判定 | 无空格 → word, 有空格 → sentence | NLP 分词 | 简单规则覆盖 95% 中英语场景 | 日文/韩文单词无空格但应走词典模式 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| ECDICT 查询 | <50ms | SQLite B-tree 索引查询 | O(log n) 词库查询，770 万词条仍然快速 |
| 词典并行查询 | <1s 总延迟 | Promise.allSettled 并发 3 个服务 | max(bing, cambridge, ecdict) latency |
| ECDICT 加载 | 首次 <3s | sql.js WASM 懒加载 + 内存 Database | 仅词库下载耗时可观，后续查询即时 |
| 结果缓存 | 同词二次查询 0ms | LRU 内存缓存 (100 条)，key = word + source | 频繁查词场景命中率 >60% |
| 必应 HTML 解析 | <10ms | 正则匹配 key span，不做 DOM 解析 | 比 DOMParser 快 ~5x |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | 必应/剑桥词典不可达 | 静默跳过，使用其他词典的结果 | 自动降级 | 无感知 (只要至少 1 个词典成功) |
| L1-网络 | Lingva 自托管服务器不可达 | 降级到公开翻译服务 (Google/百度) | 自动切换 | 无感知 |
| L2-加载 | ECDICT 词库未下载 | 提示下载词库 → 确认后下载 | 用户手动下载 | Toast + 进度条 |
| L2-加载 | ECDICT SQL.js WASM 加载失败 | 降级为纯在线词典 (必应+剑桥) | 自动降级 | 无感知 |
| L2-解析 | 必应/剑桥 HTML 结构变化 | 返回 partial 结果 + 标记 "parse_warning" | 仅丢失部分字段 | 部分结果可能缺失 (如音标) |
| L3-输入 | 查询纯数字/符号 | 不调用词典，直接提示"非有效单词" | — | Toast |

---

**关联文档**：
- 翻译服务插件：[04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md)
- AI 翻译服务：[12-prd-task-AI翻译服务.md](./12-prd-task-AI翻译服务.md)
- 测试方案：[31-prd-test-词典与本地翻译](../../tests/2026-09/31-prd-test-词典与本地翻译.md)