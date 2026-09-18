---
doc_type: test
title: "YP-08-04: 跨项目桥接 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
prd_month: "202608"
prd_task_id: "YP-08-04"
source_prds: ["04-功能实现-跨项目桥接"]
source_modules: ["04-prd-task-跨项目桥接"]
---

# YP-08-04: 跨项目桥接 — 测试规格

> 来源 PRD：[04-功能实现-跨项目桥接.md](../../prds/2026-08/04-功能实现-跨项目桥接.md)
> 开发方案：[04-prd-task-跨项目桥接.md](../../devs/2026-08/04-prd-task-跨项目桥接.md)

---

## 一、单元测试

### U-01: URL 模式匹配

```typescript
describe("URL pattern detection", () => {
  it("detects bug detail page", () => {
    expect(inferProject("https://yivad.local/#/bug/detail/abc123")).toBe("YiVad");
  });
  it("detects project page", () => {
    expect(inferProject("https://yivad.local/#/project/detail/x")).toBe("YiVad");
  });
  it("detects code review page", () => {
    expect(inferProject("https://yivad.local/#/code-review/file.ts")).toBe("YiVad");
  });
  it("detects aiChat page", () => {
    expect(inferProject("https://yivad.local/#/aiChat")).toBe("YiAi");
  });
  it("returns Other for unknown", () => {
    expect(inferProject("https://google.com")).toBe("Other");
  });
});
```

### U-02: bridgeToken 生命周期

```typescript
describe("bridgeToken", () => {
  it("U-02-S01: generate returns token", async () => {
    vi.mock("./bridgeService"); // POST /bridge/generate → { token: "tok_abc" }
    const token = await generateBridgeToken("session-1");
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });
  it("U-02-S02: token is single-use", async () => {
    // first use → success; second use → 403
  });
});
```

### U-03: Bug 报告数据验证

```typescript
describe("BugReport validation", () => {
  it("U-03-S01: required fields validated", () => {
    const data = { title: "", url: "", severity: "P2" as const, description: "" };
    const errors = validateBugReport(data);
    expect(errors).toContain("title");
    expect(errors).toContain("description");
  });
  it("U-03-S02: severity must be P0-P3", () => {
    // invalid severity → validation error
  });
  it("U-03-S03: URL must be valid format", () => {
    // "not-a-url" → validation error
  });
});
```

---

## 二、组件测试

### C-01: BugReportDialog

```typescript
describe("BugReportDialog", () => {
  it("C-01-S01: auto-fills URL and title from page context", () => {
    const wrapper = mount(BugReportDialog, {
      props: { visible: true, pageUrl: "https://example.com/bug/1", pageTitle: "Login Crash" },
    });
    expect(wrapper.find('input[name="url"]').element.value).toBe("https://example.com/bug/1");
    expect(wrapper.find('input[name="title"]').element.value).toBe("Login Crash");
  });

  it("C-01-S02: auto-infers project from URL", () => {
    // /bug/ → YiVad; /project/ → YiVad; /aiChat → YiAi
  });

  it("C-01-S03: submit calls dataService.createDocument", async () => {
    const spy = vi.fn().mockResolvedValue({ code: 0 });
    // fill form → click submit → spy called with bug data
  });

  it("C-01-S04: shows error on submit failure", async () => {
    vi.fn().mockResolvedValue({ code: 5001, message: "DB error" });
    // fill → submit → ElMessage.error shown
  });
});
```

### C-02: 跨项目导航

```typescript
describe("Cross-project navigation", () => {
  it("C-02-S01: discussInYiVad opens new tab with correct URL", async () => {
    const openSpy = vi.fn();
    vi.stubGlobal("open", openSpy);
    await store.discussInYiVadAiChat();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("/#/aiChat?session="), "_blank", "noopener,noreferrer"
    );
  });

  it("C-02-S02: bridgeToken included when available", async () => {
    // URL contains bridge_token parameter
  });

  it("C-02-S03: warns when no active conversation", async () => {
    store.activeConversation = null;
    // discussInYiVad → ElMessage.warning
  });
});
```

### C-03: QuickButtons 页面感知

```typescript
describe("QuickButtons page awareness", () => {
  it("C-03-S01: shows Analyze Bug button on bug pages", () => {
    const buttons = getPageAwareButtons("https://yivad/#/bug/detail/1");
    expect(buttons.some(b => b.value === "analyze_bug")).toBe(true);
  });
  it("C-03-S02: shows Review File button on code review pages", () => {
    const buttons = getPageAwareButtons("https://yivad/#/code-review/file.ts");
    expect(buttons.some(b => b.value === "review_file")).toBe(true);
  });
  it("C-03-S03: shows default buttons on unknown pages", () => {
    const buttons = getPageAwareButtons("https://google.com");
    expect(buttons.length).toBe(0); // 仅默认通用按钮
  });
});
```

---

## 三、集成测试

```typescript
describe("Cross-project integration", () => {
  it("I-01: end-to-end bug report flow", async () => {
    // 1. Open BugReportDialog on a bug page
    // 2. Fields auto-filled (title, url, project)
    // 3. User fills description and submits
    // 4. Verify dataService.createDocument called with correct payload
    // 5. Verify YiKnowledge file write called
  });

  it("I-02: YiVad bridge with real session", async () => {
    // 1. Create session with messages
    // 2. Click discussInYiVad
    // 3. Verify window.open called with correct session key + bridge token
  });

  it("I-03: text selection → ChatInput", async () => {
    // 1. Simulate text selection in Content Script
    // 2. Verify chrome.storage.local set
    // 3. Open ChatWindow → input auto-filled
  });
});
```

---

## 四、需求追溯矩阵

| 需求 | 单元 | 组件 | 集成 |
|------|------|------|------|
| FR-01 YiVad 桥接 | U-02 S01-02 | C-02 S01-03 | I-02 |
| FR-02 Bug 报告 | U-03 S01-03 | C-01 S01-04 | I-01 |
| FR-03 页面感知 | U-01 | C-03 S01-03 | — |
| FR-04 文本选中 | — | — | I-03 |

---

## 五、完成定义

- [ ] 单元测试：U-01(5) + U-02(2) + U-03(3) = 10 用例全通过
- [ ] 组件测试：C-01(4) + C-02(3) + C-03(3) = 10 用例全通过
- [ ] 集成测试：I-01~03 全通过
- [ ] `npm test` 全量通过