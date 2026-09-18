---
doc_type: module
prd_task_id: "YP-08-04"
title: "YP-08-04: 跨项目桥接 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "04-功能实现-跨项目桥接"
source_okr: [yipet-003]
---

# YP-08-04: 跨项目桥接 — 开发方案

> 来源 PRD：[04-功能实现-跨项目桥接.md](../../prds/2026-08/04-功能实现-跨项目桥接.md)
> 需求编号：YP-08-04 · 优先级：P1 · 人天：2.0d

---

## 一、架构

YiPet 运行在任意网页上，是唯一横跨 YiAi/YiVad/YiKnowledge 的 UI 入口。跨项目桥接通过 `chrome.runtime.sendMessage`（Content Script ↔ Service Worker）+ `window.open`（打开 YiVad）+ 桥接 Token（一次性认证）实现。

```
┌──────────────────────────────────────────────────────┐
│ Content Script (页面感知 + 文本选中)                  │
│   └── chrome.runtime.sendMessage ──→ Service Worker  │
├──────────────────────────────────────────────────────┤
│ ChatWindow                                           │
│   ├── ChatToolbar: 跨项目导航下拉菜单                 │
│   │   ├── "Discuss in YiVad" → discussInYiVadAiChat()│
│   │   └── "Report Bug" → BugReportDialog             │
│   ├── QuickButtons: 页面感知快捷按钮                  │
│   └── ChatInput: 选中文本自动填充                     │
├──────────────────────────────────────────────────────┤
│ YiAi bridge_service.py                               │
│   └── POST /bridge/generate → { token, sessionKey }  │
└──────────────────────────────────────────────────────┘
```

---

## 二、核心模块

### 2.1 YiVad 桥接

```typescript
// stores/chat.ts → discussInYiVadAiChat
async function discussInYiVadAiChat() {
  const s = activeConversation.value; if (!s) return;
  await persistActive(); // 确保 MongoDB 已同步
  const bridgeToken = await generateBridgeToken(s.key);
  const yivadUrl = import.meta.env.VITE_YIVAD_BASE_URL || "http://localhost:8848";
  window.open(
    `${yivadUrl}/#/aiChat?session=${s.key}&bridge_token=${bridgeToken}`,
    "_blank", "noopener,noreferrer"
  );
}

// api/modules/bridgeService.ts
async function generateBridgeToken(sessionKey: string): Promise<string> {
  const res = await fetch(`${API_BASE}/bridge/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Token": getToken() },
    body: JSON.stringify({ session_key: sessionKey }),
  });
  const json = await res.json();
  return json.data?.token || "";
}
```

**桥接 Token**：一次性使用，5min 过期，绑定 session key。YiVad 验证后自动登录并恢复会话。

### 2.2 Bug 报告

```typescript
// BugReportDialog.vue
interface BugReportData {
  title: string;         // 自动填充: document.title
  url: string;           // 自动填充: window.location.href
  project: string;       // 自动推断: URL 模式匹配
  module?: string;
  severity: "P0" | "P1" | "P2" | "P3";
  description: string;
  steps?: string;
}

function inferProject(url: string): string {
  if (/\/bug\//.test(url)) return "YiVad";
  if (/\/project\//.test(url)) return "YiVad";
  if (/\/code-review\//.test(url)) return "YiVad";
  if (/\/aiChat/.test(url)) return "YiAi";
  if (/\/yipet/.test(url)) return "YiPet";
  return "Other";
}

async function submitBug(data: BugReportData) {
  // 1. MongoDB bugs 集合
  await dataService.createDocument("bugs", {
    ...data, status: "open", createdAt: Date.now(),
  });
  // 2. YiKnowledge 知识库
  const bugMd = `---
title: "${data.title}"
tags: [bug, ${data.project}, ${data.severity}]
---

# ${data.title}

- **URL**: ${data.url}
- **Severity**: ${data.severity}
- **Project**: ${data.project}

## Description
${data.description}
${data.steps ? `\n## Steps\n${data.steps}` : ""}`;

  await knowledgeService.writeKnowledgeFile(
    `projects/${data.project.toLowerCase()}/bugs/${Date.now()}-bug.md`,
    bugMd
  );
}
```

### 2.3 页面感知

```typescript
// QuickButtons.vue — 根据 URL 模式动态展示
const pageAwareButtons = computed(() => {
  const url = getCurrentPageUrl(); // via Content Script → chrome.storage
  const buttons: QuickButton[] = [];

  if (/\/bug\/detail\//.test(url)) {
    buttons.push({
      label: "分析此 Bug", value: "analyze_bug",
      content: `Analyze the bug at ${url}. Identify root cause and suggest fix.`,
    });
  }
  if (/\/code-review\//.test(url)) {
    buttons.push({
      label: "审查此文件", value: "review_file",
      content: `Perform a thorough code review of ${url}. Check for bugs, performance, security.`,
    });
  }
  if (/\/project\/detail\//.test(url)) {
    buttons.push({
      label: "项目摘要", value: "summarize_project",
      content: `Summarize the project at ${url}: progress, risks, key milestones.`,
    });
  }
  return buttons;
});
```

### 2.4 文本选中集成

```typescript
// Content Script → chrome.runtime.sendMessage → Service Worker → ChatWindow
document.addEventListener("mouseup", () => {
  const sel = window.getSelection()?.toString().trim();
  if (sel && sel.length > 0) {
    chrome.runtime.sendMessage({
      type: "text_selected", text: sel, url: location.href,
    });
  }
});

// ChatInput — 读取选中文本
const stored = await chrome.storage.local.get(["selectedText", "sourceUrl"]);
if (stored.selectedText && !store.input) {
  store.input = stored.selectedText;
  chrome.storage.local.remove(["selectedText", "sourceUrl"]);
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | YiVad 桥接: window.open + bridgeToken | `chat.ts`, `bridgeService.ts` | 点击 → YiVad 打开 + 会话恢复 | 0.5 |
| 2 | Bug 报告: BugReportDialog + 双写 | `BugReportDialog.vue`, `bug.ts` | 提交 → MongoDB + YiKnowledge | 0.5 |
| 3 | 页面感知: URL 匹配 + QuickButtons | `QuickButtons.vue`, ContentScript | 不同页面 → 不同按钮 | 0.5 |
| 4 | 文本选中: ContentScript → ChatInput | `ContentScript`, `ChatInput.vue` | 选中文本自动填充 | 0.25 |
| 5 | 集成测试 + 回归 | `tests/` | 全量通过 | 0.25 |

**总计：2.0d**

---

## 四、边缘场景

| 场景 | 处理 |
|------|------|
| YiVad 未运行 | bridgeToken 超时 → ElMessage.warning |
| bridgeToken 过期 | 5min 自动失效，需重新生成 |
| 文本选中跨域 | Content Script 注入 MV3 白名单域名 |
| Bug 报告字段为空 | 前端 required 校验 |
| 页面 URL 无匹配模式 | QuickButtons 显示默认通用按钮 |

---

## 五、安全

| 要求 | 实现 |
|------|------|
| bridgeToken 一次性 | YiAi 生成后使用即销毁 |
| window.open | `noopener,noreferrer` 防 opener 攻击 |
| Content Script | 仅注入白名单域名 |
| Bug 报告 | 复用 X-Token 认证 |

---

## 六、完成定义

- [ ] YiVad 桥接: window.open + session 恢复
- [ ] Bug 报告: 模态框 + 自动填充 + 双写
- [ ] 页面感知: 3+ URL 模式 + 动态 QuickButtons
- [ ] 文本选中: ContentScript → ChatInput
- [ ] `tsc --noEmit` + `npm test` 通过