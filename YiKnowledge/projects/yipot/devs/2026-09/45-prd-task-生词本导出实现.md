---

doc_type: module
prd_task_id: "YP-09-S13"
title: "生词本导出 (Anki/欧路) — 开发方案"
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
source_prd: "24-prd-生词本导出.md"

type: task
---

# 生词本导出 (Anki/欧路) — 开发方案

> 来源 PRD：[24-prd-生词本导出.md](../../prds/2026-09/24-prd-生词本导出.md)

## 架构概览

```
翻译窗口 用户点击"添加到生词本"
      │
      │  { word, translation, context, timestamp }
      ▼
┌───────────────────────────────────────────────────┐
│           生词本导出服务 (React)                   │
│                                                    │
│  exportToAnki(word, translation, options)          │
│    │  POST http://127.0.0.1:8765 (AnkiConnect)    │
│    │  body: {                                      │
│    │    action: "addNote",                         │
│    │    params: {                                  │
│    │      note: {                                  │
│    │        deckName: options.deck || "Default",   │
│    │        modelName: options.model || "Basic",   │
│    │        fields: {                              │
│    │          Front: word,                         │
│    │          Back: translation,                   │
│    │        }                                      │
│    │      }                                        │
│    │    }                                          │
│    │  }                                            │
│    ▼  { result: noteId, error: null }             │
│                                                    │
│  exportToEudic(word, translation, options)         │
│    │  POST https://dict.eudic.net/api/addword      │
│    │  OR POST http://localhost:{eudic_port}/add    │
│    │  body: { word, translation, dict: "en" }     │
│    ▼  { success: true }                           │
│                                                    │
│  Field Mapping (用户可配置):                       │
│    word → Front / Word / Expression                │
│    translation → Back / Meaning / Translation      │
│    context → Extra / Example / Context             │
│    pronunciation → Audio / Phonetic                │
└───────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

前端 `services/vocabulary/exporters/`

### Anki 导出 (AnkiConnect)

```javascript
// services/vocabulary/exporters/anki.jsx
const ANKI_CONNECT_URL = "http://127.0.0.1:8765";

export async function addToAnki({ word, translation, context, pronunciation }, options = {}) {
  const { deck = "Default", model = "Basic", fieldMapping = {} } = options;

  // 字段映射: 用户自定义 word → Front or Back
  const fields = {};
  fields[fieldMapping.word || "Front"] = word;
  fields[fieldMapping.translation || "Back"] = translation;
  if (context && fieldMapping.context) {
    fields[fieldMapping.context] = context;
  }
  if (pronunciation && fieldMapping.pronunciation) {
    fields[fieldMapping.pronunciation] = pronunciation;
  }

  const payload = {
    action: "addNote",
    version: 6,
    params: {
      note: {
        deckName: deck,
        modelName: model,
        fields,
        tags: ["pot-app"],
      },
    },
  };

  try {
    const response = await fetch(ANKI_CONNECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`AnkiConnect error: ${data.error}`);
    }

    return { noteId: data.result, source: "anki" };
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("Anki 未启动，请先启动 Anki 并安装 AnkiConnect 插件");
    }
    throw err;
  }
}
```

### 欧路词典导出

```javascript
// services/vocabulary/exporters/eudic.jsx
const EUDIC_DICT_API = "https://dict.eudic.net/api/addword";

export async function addToEudic({ word, translation }) {
  try {
    const response = await fetch(EUDIC_DICT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 需要在欧路词典设置中获取 API Token
      body: JSON.stringify({
        word,
        translation,
        dict: "english",
      }),
    });

    if (!response.ok) {
      throw new Error(`欧路词典返回错误: ${response.status}`);
    }
    return { success: true, source: "eudic" };
  } catch (err) {
    throw new Error("欧路词典导出失败，请检查网络连接和 API 配置");
  }
}
```

### 批量导出

```javascript
// services/vocabulary/exporters/index.jsx
export async function batchExport(entries, target) {
  const results = { success: [], failed: [] };

  for (const entry of entries) {
    try {
      if (target === "anki") {
        const { noteId } = await addToAnki(entry);
        results.success.push({ word: entry.word, id: noteId });
      } else if (target === "eudic") {
        await addToEudic(entry);
        results.success.push({ word: entry.word });
      }
    } catch (err) {
      results.failed.push({ word: entry.word, error: err.message });
    }
  }

  return results;
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| Anki 接口 | AnkiConnect HTTP API (localhost:8765) | apkg 文件导入 | HTTP API 即时生效，无需用户手动导入手动导入 | 依赖 Anki 运行 + AnkiConnect 插件 |
| 字段映射 | 用户可配置 (setting panel) | 固定 Front/Back | 不同用户使用不同笔记模板 (Basic/Cloze/自定义) | 配置复杂度增加 |
| 批量导出 | 串行逐个创建 (含错误收集) | 并发创建 | AnkiConnect 不支持并发 addNote，串行避免冲突 | 大量词汇导出较慢 (100 条 ~30s) |
| 欧路词典 | HTTP API 直连 | 本地进程调用 | 欧路词典有标准 HTTP API | 需欧路词典运行且已配置 API Token |
| 错误隔离 | 批量导出单条失败不影响整体 | 一条失败全部回滚 | 部分成功优于全部失败，用户可单独重试失败项 | 可能产生部分重复卡片 |
| 身份映射 | Tags ["pot-app"] 标记来源 | 无标记 | 方便用户在 Anki 中过滤/管理 Pot 创建的卡片 | — |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 重复检测 | 避免创建重复卡片 | 导出前调用 AnkiConnect `findNotes` 检查 | 现有卡片跳过，仅提示"已存在" |
| 批量导出 | 单条 <300ms, 100 条 <30s | 串行 + 进度条 UI 反馈 | 用户可跟踪导出进度 |
| 网络超时 | 避免无限等待 | fetch timeout 5s (AnkiConnect 本地极快) | 无响应时快速失败 |
| 请求去重 | 防止误点重复导出 | 按钮 loading 状态 + 最近 2s 内相同请求忽略 | — |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-连接 | Anki 未启动 (connection refused) | 提示"请先启动 Anki" | 用户启动 Anki 后重试 | Toast 友好提示 |
| L1-连接 | AnkiConnect 插件未安装 | 提示"请安装 AnkiConnect 插件"并给出插件 ID | 用户安装插件后重试 | Toast + 安装指引 |
| L2-Anki | deck 或 model 不存在 | 自动使用 Default deck + Basic model | 自动降级 | 轻微提示 |
| L2-Anki | 字段映射不匹配 model | 仅填充匹配的字段，忽略不匹配的 | 部分数据写入 | Toast "部分字段未匹配" |
| L3-欧路 | API Token 未配置 | 提示"请在设置中配置欧路词典 API Token" | 用户配置后重试 | 设置页引导 |
| L3-网络 | 欧路 API 超时 | 提示"网络连接失败" | 用户检查网络后重试 | Toast |

---

**关联文档**：
- 翻译服务插件：[04-prd-task-翻译服务插件实现.md](./04-prd-task-翻译服务插件实现.md)
- 测试方案：[24-prd-test-生词本导出](../../tests/2026-09/24-prd-test-生词本导出.md)