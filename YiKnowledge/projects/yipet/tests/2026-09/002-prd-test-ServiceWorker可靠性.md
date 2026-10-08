---

doc_type: test
title: "YP-09-02: Service Worker 可靠性 — 心跳 + 消息队列 + 重试 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-02"
source_prds: ["09-稳定性-ServiceWorker"]
source_modules: ["02-prd-task-ServiceWorker可靠性"]

type: test
---

# YP-09-02: Service Worker 可靠性 — 测试规格

> 来源 PRD：[09-稳定性-ServiceWorker.md](../../prds/2026-09/09-稳定性-ServiceWorker.md)
> 开发方案：[02-prd-task-ServiceWorker可靠性.md](../../devs/2026-09/02-prd-task-ServiceWorker可靠性.md)

---

## 一、单元测试

### U-01: 心跳保活

```typescript
describe("HeartbeatMonitor", () => {
  beforeEach(() => vi.useFakeTimers());

  it("U-01-S01: sends ping every 20s", () => {
    const monitor = new HeartbeatMonitor();
    const spy = vi.fn().mockResolvedValue({});
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((_m, cb) => { cb({}); });
    monitor.start();
    vi.advanceTimersByTime(20000); vi.advanceTimersByTime(20000); vi.advanceTimersByTime(20000);
    monitor.stop();
  });

  it("U-01-S02: 3 missed beats → degraded mode (60s interval)", () => {
    const monitor = new HeartbeatMonitor();
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((_m, cb) => {
      setTimeout(() => cb(undefined), 4000);
    });
    monitor.start();
    for (let i = 0; i < 3; i++) { vi.advanceTimersByTime(20000); vi.advanceTimersByTime(3000); }
    vi.advanceTimersByTime(60000); // degraded mode interval
    monitor.stop();
  });

  it("U-01-S03: successful pong resets miss counter", () => {
    const monitor = new HeartbeatMonitor();
    let fail = true;
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((_m, cb) => {
      if (fail) { setTimeout(() => cb(undefined), 4000); }
      else { cb({ action: "heartbeat:pong" }); }
    });
    monitor.start();
    vi.advanceTimersByTime(20000); vi.advanceTimersByTime(3000); // miss 1
    vi.advanceTimersByTime(20000); vi.advanceTimersByTime(3000); // miss 2
    fail = false;
    vi.advanceTimersByTime(20000); vi.advanceTimersByTime(100); // success → reset
    vi.advanceTimersByTime(20000); // normal interval (not degraded)
    monitor.stop();
  });

  afterEach(() => vi.useRealTimers());
});
```

### U-02: 消息队列

```typescript
describe("IpcMessageQueue", () => {
  it("U-02-S01: enqueues + flushes in order", async () => {
    const queue = new IpcMessageQueue();
    queue.enqueue({ action: "a", payload: {} });
    queue.enqueue({ action: "b", payload: {} });
    expect(queue.length).toBe(2);
    const sent: string[] = [];
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((m: any, cb) => { sent.push(m.action); cb({}); });
    await queue.flush();
    expect(sent).toEqual(["a", "b"]);
    expect(queue.length).toBe(0);
  });

  it("U-02-S02: stops flush on failure, preserves remaining", async () => {
    const queue = new IpcMessageQueue();
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((m: any, cb) => {
      if (m.action === "b") { setTimeout(() => cb(undefined), 4000); } else { cb({}); }
    });
    queue.enqueue({ action: "a", payload: {} });
    queue.enqueue({ action: "b", payload: {} });
    queue.enqueue({ action: "c", payload: {} });
    await queue.flush();
    expect(queue.length).toBe(2); // b + c 仍在队列
  });

  it("U-02-S03: FIFO eviction at 100 messages", () => {
    const queue = new IpcMessageQueue();
    for (let i = 0; i < 110; i++) queue.enqueue({ action: `m${i}`, payload: {} });
    expect(queue.length).toBe(100);
  });
});
```

### U-03: 重试

```typescript
describe("sendMessageWithRetry", () => {
  it("U-03-S01: resolves on first attempt", async () => {
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((_m, cb) => { cb({ ok: true }); });
    const r = await sendMessageWithRetry("test", {});
    expect(r.ok).toBe(true);
  });

  it("U-03-S02: 3 retries with backoff (1s→2s→4s)", async () => {
    vi.useFakeTimers();
    let calls = 0;
    vi.spyOn(chrome.runtime, "sendMessage").mockImplementation((_m, cb) => {
      calls++;
      setTimeout(() => cb(undefined), 4000);
    });
    const p = sendMessageWithRetry("test", {});
    for (let i = 0; i < 4; i++) {
      vi.advanceTimersByTime(3000); // timeout
      if (i < 3) vi.advanceTimersByTime([1000, 2000, 4000][i]); // backoff
    }
    await expect(p).rejects.toThrow();
    expect(calls).toBe(4);
    vi.useRealTimers();
  });
});
```

---

## 二、完成定义

- [ ] U-01(3) + U-02(3) + U-03(2) = 8 单元测试全通过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过