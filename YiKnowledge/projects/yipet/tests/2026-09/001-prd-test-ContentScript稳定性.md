---

doc_type: test
title: "YP-09-01: Content Script 稳定性 — SPA 路由检测 + MutationObserver + 注入重试 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
prd_task_id: "YP-09-01"
source_prds: ["08-稳定性-ContentScript"]
source_modules: ["01-prd-task-ContentScript稳定性"]

type: test
---

# YP-09-01: Content Script 稳定性 — 测试规格

> 来源 PRD：[08-稳定性-ContentScript.md](../../prds/2026-09/08-稳定性-ContentScript.md)
> 开发方案：[01-prd-task-ContentScript稳定性.md](../../devs/2026-09/01-prd-task-ContentScript稳定性.md)

---

## 一、单元测试

### U-01: SPA 路由检测

```typescript
describe("SPA route detection", () => {
  it("U-01-S01: pushState triggers route change callback", () => {
    let called = false;
    onRouteChanged(() => { called = true; });
    history.pushState({}, "", "/new-page");
    expect(called).toBe(true);
  });

  it("U-01-S02: replaceState triggers route change callback", () => {
    let called = false;
    onRouteChanged(() => { called = true; });
    history.replaceState({}, "", "/replaced");
    expect(called).toBe(true);
  });

  it("U-01-S03: popstate triggers route change callback", () => {
    let called = false;
    onRouteChanged(() => { called = true; });
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(called).toBe(true);
  });

  it("U-01-S04: route change delayed 100ms for SPA DOM update", async () => {
    let called = false;
    onRouteChanged(() => { called = true; });
    history.pushState({}, "", "/new");
    expect(called).toBe(false); // 未延迟完成
    await sleep(150);
    expect(called).toBe(true);
  });
});
```

### U-02: 注入状态机

```typescript
describe("InjectionStateMachine", () => {
  it("U-02-S01: initial state is NOT_LOADED", () => {
    const sm = new InjectionStateMachine();
    expect(sm.state).toBe("NOT_LOADED");
  });

  it("U-02-S02: successful injection transitions LOADING→LOADED", async () => {
    vi.spyOn(bootstrap, "inject").mockResolvedValue();
    const sm = new InjectionStateMachine();
    await sm.checkAndReinject();
    expect(sm.state).toBe("LOADED");
  });

  it("U-02-S03: DOM exists + LOADED → skip reinjection", async () => {
    document.body.innerHTML = '<div id="yipet-overlay"></div>';
    const sm = new InjectionStateMachine();
    sm.state = "LOADED";
    const spy = vi.spyOn(bootstrap, "inject");
    await sm.checkAndReinject();
    expect(spy).not.toHaveBeenCalled();
  });

  it("U-02-S04: DOM lost + LOADED → re-inject", async () => {
    document.body.innerHTML = ''; // pet DOM removed
    const sm = new InjectionStateMachine();
    sm.state = "LOADED";
    const spy = vi.spyOn(bootstrap, "inject").mockResolvedValue();
    await sm.checkAndReinject();
    expect(spy).toHaveBeenCalled();
  });

  it("U-02-S05: retry 3 times with exponential backoff on failure", async () => {
    vi.useFakeTimers();
    vi.spyOn(bootstrap, "inject").mockRejectedValue(new Error("CSP blocked"));
    const sm = new InjectionStateMachine();
    const promise = sm.checkAndReinject();
    // 1st: immediate; 2nd: 2s; 3rd: 4s
    await vi.advanceTimersByTimeAsync(100); // 1st fail
    await vi.advanceTimersByTimeAsync(2000); // wait + 2nd fail
    await vi.advanceTimersByTimeAsync(4000); // wait + 3rd fail
    expect(sm.state).toBe("FAILED");
    vi.useRealTimers();
  });
});
```

---

## 二、集成测试

```typescript
describe("Content Script integration", () => {
  it("I-01: SPA pushState × 5 → pet still visible", async () => {
    bootstrap();
    expect(document.getElementById("yipet-overlay")).not.toBeNull();
    for (let i = 0; i < 5; i++) {
      history.pushState({}, "", `/page-${i}`);
      await sleep(150);
    }
    expect(document.getElementById("yipet-overlay")).not.toBeNull();
  });

  it("I-02: body replaced by SPA → pet re-injected", async () => {
    bootstrap();
    document.body.innerHTML = '<div id="new-app-root"></div>';
    await sleep(250); // MutationObserver 200ms throttle + 50ms margin
    expect(document.getElementById("yipet-overlay")).not.toBeNull();
  });
});
```

---

## 三、完成定义

- [ ] U-01(4) + U-02(5) = 9 单元测试全通过
- [ ] I-01~02 集成测试全通过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过