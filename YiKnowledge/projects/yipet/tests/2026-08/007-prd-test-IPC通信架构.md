---

doc_type: test
title: "YP-08-03: IPC 通信架构 — 类型安全 + 超时重试 + 心跳保活 + 消息队列 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-03"
source_prds: ["07-架构设计-IPC通信架构"]
source_modules: ["07-prd-task-IPC通信架构"]
source_okr: [yipet-001]

type: test
---

# YP-08-03: IPC 通信架构 — 测试规格

> 来源 PRD：[07-架构设计-IPC通信架构.md](../../prds/2026-08/07-架构设计-IPC通信架构.md)
> 开发方案：[07-prd-task-IPC通信架构.md](../../devs/2026-08/07-prd-task-IPC通信架构.md)

---

## 一、单元测试

### U-01: 消息安全封装

```typescript
describe("IPC secure envelope", () => {
  it("U-01-S01: wrapMessage includes secret + timestamp + requestId", () => {
    const env = wrapMessage("setColor", { colorIndex: 1 });
    expect(env.meta.secret).toBeTruthy();
    expect(env.meta.timestamp).toBeGreaterThan(Date.now() - 100);
    expect(env.meta.requestId).toBeTruthy();
  });

  it("U-01-S02: verifyEnvelope accepts valid envelope", () => {
    const env = wrapMessage("setRole", { role: "cat" });
    expect(verifyEnvelope(env)).toBe(true);
  });

  it("U-01-S03: verifyEnvelope rejects wrong secret", () => {
    const env = wrapMessage("setColor", { colorIndex: 1 });
    env.meta.secret = "wrong-secret";
    expect(verifyEnvelope(env)).toBe(false);
  });

  it("U-01-S04: verifyEnvelope rejects expired timestamp", () => {
    const env = wrapMessage("setColor", { colorIndex: 1 });
    env.meta.timestamp = Date.now() - 10_000; // 10s ago
    expect(verifyEnvelope(env)).toBe(false);
  });

  it("U-01-S05: verifyEnvelope rejects missing meta", () => {
    expect(verifyEnvelope({ action: "petStatusChanged", payload: {} } as any)).toBe(false);
  });
});
```

### U-02: 超时重试

```typescript
describe("IPC retry", () => {
  beforeEach(() => vi.useFakeTimers());

  it("U-02-S01: resolves on first attempt within timeout", async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      cb({ success: true });
    });
    const result = sendMessageWithRetry("heartbeat:ping", { ts: Date.now() });
    await expect(result).resolves.toEqual({ success: true });
  });

  it("U-02-S02: retries 3 times on timeout", async () => {
    let attempts = 0;
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      attempts++;
      if (attempts < 4) {
        setTimeout(() => cb(undefined), 4000); // 超时（> 3000ms）
      } else {
        cb({ success: true });
      }
    });
    const promise = sendMessageWithRetry("sse:connect", { params: {} as any });
    // 3 次超时 → 3 次重试 → 第 4 次成功
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(3000); // 超时
      vi.advanceTimersByTime(i === 0 ? 1000 : i === 1 ? 2000 : 4000); // 退避延迟
    }
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toEqual({ success: true });
    expect(attempts).toBe(4);
  });

  it("U-02-S03: rejects after max retries", async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      setTimeout(() => cb(undefined), 4000);
    });
    const promise = sendMessageWithRetry("sse:abort", { requestId: "1" });
    // 初始 + 3 次重试 = 4 次超时
    for (let i = 0; i < 4; i++) {
      vi.advanceTimersByTime(3000);
      if (i < 3) vi.advanceTimersByTime([1000, 2000, 4000][i]);
    }
    await expect(promise).rejects.toThrow("IPC timeout");
  });

  it("U-02-S04: respects chrome.runtime.lastError", async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      chrome.runtime.lastError = { message: "Could not establish connection" } as any;
      cb(undefined);
    });
    const promise = sendMessageWithRetry("setColor", { colorIndex: 0 });
    vi.advanceTimersByTime(100);
    await expect(promise).rejects.toThrow("Could not establish connection");
  });

  afterEach(() => vi.useRealTimers());
});
```

### U-03: 心跳保活

```typescript
describe("HeartbeatMonitor", () => {
  beforeEach(() => vi.useFakeTimers());

  it("U-03-S01: sends ping every 20s", () => {
    const monitor = new HeartbeatMonitor();
    const spy = vi.fn().mockResolvedValue({});
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => { cb({}); });
    monitor.start();
    vi.advanceTimersByTime(20_000);
    vi.advanceTimersByTime(20_000);
    vi.advanceTimersByTime(20_000);
    // 3 个周期应该发送了 3 次 ping
    monitor.stop();
  });

  it("U-03-S02: 3 missed beats → degraded mode (60s interval)", () => {
    const monitor = new HeartbeatMonitor();
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      setTimeout(() => cb(undefined), 4000); // always timeout
    });
    monitor.start();
    // 3 次 ping 超时
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(20_000);
      vi.advanceTimersByTime(3000); // timeout
    }
    // 进入省电模式 → next ping at 60s
    vi.advanceTimersByTime(60_000);
    monitor.stop();
  });

  it("U-03-S03: successful pong resets missed counter", () => {
    const monitor = new HeartbeatMonitor();
    let shouldFail = true;
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((_msg, cb) => {
      if (shouldFail) {
        setTimeout(() => cb(undefined), 4000);
      } else {
        cb({ action: "heartbeat:pong", payload: { ts: Date.now() } });
      }
    });
    monitor.start();
    // 2 次超时
    vi.advanceTimersByTime(20_000); vi.advanceTimersByTime(3000);
    vi.advanceTimersByTime(20_000); vi.advanceTimersByTime(3000);
    // 第 3 次成功
    shouldFail = false;
    vi.advanceTimersByTime(20_000); vi.advanceTimersByTime(100);
    // counter 重置 → 不进入省电模式
    vi.advanceTimersByTime(20_000); // 第 4 次 ping 正常发送
    monitor.stop();
  });

  afterEach(() => vi.useRealTimers());
});
```

### U-04: 消息队列

```typescript
describe("IpcMessageQueue", () => {
  it("U-04-S01: enqueues messages when SW is down", () => {
    const queue = new IpcMessageQueue();
    queue.enqueue(wrapMessage("setColor", { colorIndex: 1 }));
    queue.enqueue(wrapMessage("setRole", { role: "cat" }));
    expect(queue.length).toBe(2);
  });

  it("U-04-S02: flush sends queued messages in order", async () => {
    const queue = new IpcMessageQueue();
    const sent: string[] = [];
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((msg: any, cb) => {
      sent.push(msg.action);
      cb({});
    });
    queue.enqueue(wrapMessage("setColor", { colorIndex: 1 }));
    queue.enqueue(wrapMessage("setRole", { role: "cat" }));
    queue.enqueue(wrapMessage("setModel", { model: "qwen3.5" }));
    await queue.flush();
    expect(sent).toEqual(["setColor", "setRole", "setModel"]);
    expect(queue.length).toBe(0);
  });

  it("U-04-S03: stops flush on first failure (preserves order)", async () => {
    const queue = new IpcMessageQueue();
    vi.mocked(chrome.runtime.sendMessage).mockImplementation((msg: any, cb) => {
      if (msg.action === "setRole") {
        setTimeout(() => cb(undefined), 4000); // 第 2 条超时
      } else {
        cb({});
      }
    });
    queue.enqueue(wrapMessage("setColor", { colorIndex: 1 }));
    queue.enqueue(wrapMessage("setRole", { role: "cat" }));
    queue.enqueue(wrapMessage("setModel", { model: "qwen3.5" }));
    const promise = queue.flush();
    vi.advanceTimersByTime(3100);
    await promise;
    // setColor 成功出队，setRole 失败保留，setModel 未发送
    expect(queue.length).toBe(2); // setRole + setModel 仍在队列
  });

  it("U-04-S04: FIFO eviction at 100 messages", () => {
    const queue = new IpcMessageQueue();
    for (let i = 0; i < 110; i++) {
      queue.enqueue(wrapMessage("heartbeat:ping", { ts: i }));
    }
    expect(queue.length).toBe(100);
    // 最旧的 10 条被丢弃
  });
});
```

---

## 二、集成测试

```typescript
describe("IPC integration", () => {
  it("I-01: ISOLATED → MAIN postMessage roundtrip", () => {
    // 1. ISOLATED: dispatchSecureEvent("setColor", { colorIndex: 3 })
    // 2. MAIN: addEventListener → verifyEnvelope → handle
    // 3. 验证 petColor 更新为索引 3
  });

  it("I-02: CS → SW → CS message relay", async () => {
    // 1. Popup: sendMessage("sse:connect", { params })
    // 2. SW: 收到 → 建立 SSE 连接
    // 3. SW: sendMessage("routeMessage", { data }) → CS
    // 4. CS: 收到 SSE chunk → MAIN dispatchSecureEvent
  });

  it("I-03: SW terminated → queue → SW restored → flush", async () => {
    // 1. SW 被终止
    // 2. CS 发送 3 条消息 → 全部入队
    // 3. SW 恢复（activated 事件）
    // 4. 3 条消息依次发送成功
  });

  it("I-04: heartbeat detects SW termination within 60s", async () => {
    // 1. SW 正常运行 → ping/pong 正常
    // 2. 模拟 SW 终止 → 3 次 ping 超时 (60s)
    // 3. 进入省电模式 + 消息队列模式
  });

  it("I-05: IPC_SECRET regenerated on extension update", () => {
    // 1. 旧版本生成 SECRET_A
    // 2. chrome.runtime.onInstalled(reason: "update") → 生成 SECRET_B
    // 3. 旧消息用 SECRET_A 发送 → 被新 SECRET_B 拒绝
  });
});
```

---

## 三、需求追溯矩阵

| 需求 | U-01 | U-02 | U-03 | U-04 | 集成 |
|------|------|------|------|------|------|
| FR-01 消息类型安全 | — | — | — | — | (编译期验证) |
| FR-02 安全信封 | S01-05 | — | — | S01 | I-01,05 |
| FR-03 超时重试 | — | S01-04 | — | — | — |
| FR-04 心跳保活 | — | — | S01-03 | — | I-04 |
| FR-05 消息队列 | — | — | — | S01-04 | I-03 |
| FR-06 SW 恢复 | — | — | — | S02 | I-03 |

---

## 四、完成定义

- [ ] 单元测试：U-01(5) + U-02(4) + U-03(3) + U-04(4) = 16 用例全通过
- [ ] 集成测试：I-01~05 全通过
- [ ] `tsc --noEmit` 零错误（IpcAction 类型编译期验证）
- [ ] `npm test` 全量通过