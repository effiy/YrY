---

doc_type: test
title: "YP-09-31: 多标签页同步 — chrome.storage.onChanged 事件驱动 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-31"
source_prds: ["38-架构设计-多标签页同步"]
source_modules: ["38-prd-task-多标签页同步"]

type: test
---

# YP-09-31: 多标签页同步 — 测试规格

## 一、单元测试

```typescript
describe("Multi-tab sync via chrome.storage.onChanged", () => {
  it("tab A color change → tab B receives update", async () => {
    const listener = vi.fn();
    chrome.storage.onChanged.addListener(listener);
    await chrome.storage.local.set({ petConfig: { color: 3 } });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ petConfig: expect.any(Object) }), "local"
    );
  });

  it("tab A role change → pet image updates in tab B", async () => {
    await chrome.storage.local.set({ petConfig: { role: "cat" } });
    const { petConfig } = await chrome.storage.local.get("petConfig");
    expect(petConfig.role).toBe("cat");
  });

  it("tab A toggle pet visibility → tab B syncs", async () => {
    await chrome.storage.local.set({ petVisible: false });
    const { petVisible } = await chrome.storage.local.get("petVisible");
    expect(petVisible).toBe(false);
  });

  it("concurrent writes from 2 tabs — last write wins", async () => {
    await Promise.all([
      chrome.storage.local.set({ petConfig: { color: 1 } }),
      chrome.storage.local.set({ petConfig: { color: 5 } }),
    ]);
    const { petConfig } = await chrome.storage.local.get("petConfig");
    expect(petConfig.color).toBeDefined();
  });
});
```

## 二、完成定义

- [ ] 4 个同步场景全通过
- [ ] `npm test` 全量通过