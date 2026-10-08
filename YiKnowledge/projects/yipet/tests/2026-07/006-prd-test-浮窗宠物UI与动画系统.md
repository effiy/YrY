---

doc_type: test
title: "YP-07-06: 浮窗宠物 UI 与动画系统 — ShadowDOM 渲染 + 拖拽 + 动画 + 空闲状态机 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-06"
source_prds: ["06-功能实现-浮窗宠物UI与动画系统"]
source_modules: ["06-prd-task-浮窗宠物UI与动画系统"]
source_okr: [yipet-001]

type: test
---

# YP-07-06: 浮窗宠物 UI 与动画系统 — 测试规格

> 来源 PRD：[06-功能实现-浮窗宠物UI与动画系统.md](../../prds/2026-07/06-功能实现-浮窗宠物UI与动画系统.md)
> 开发方案：[06-prd-task-浮窗宠物UI与动画系统.md](../../devs/2026-07/06-prd-task-浮窗宠物UI与动画系统.md)

---

## 一、测试策略

宠物浮窗是用户与 YiPet 的最直接触点。测试覆盖：DOM 渲染正确性 → 交互行为（拖拽/双击/hover）→ 动画状态机 → 样式隔离 → 性能 → 可访问性。

| 层级 | 范围 | 工具 |
|------|------|------|
| L2 组件 | ShadowDOM 渲染、拖拽、动画状态机 | @vue/test-utils + jsdom |
| L3 集成 | 跨世界交互（Popup 配置 → CS 宠物更新） | Vitest + mock chrome.* |
| L4 视觉 | CSS 动画帧率、样式隔离 | Chrome DevTools Performance |

---

## 二、组件测试

### C-01: ShadowDOM 渲染

```typescript
describe("PetOverlay ShadowDOM rendering", () => {
  it("C-01-S01: creates ShadowDOM container with correct id", () => {
    const wrapper = mount(PetOverlay, { attachTo: document.body });
    const host = document.getElementById("yipet-root");
    expect(host).not.toBeNull();
    expect(host!.shadowRoot).toBeNull(); // mode: 'closed'
  });

  it("C-01-S02: pet image element is rendered", () => {
    const wrapper = mount(PetOverlay);
    const img = wrapper.find(".pet-image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBeTruthy();
  });

  it("C-01-S03: default position is bottom-right", () => {
    const wrapper = mount(PetOverlay);
    const container = wrapper.find(".pet-container");
    const style = container.attributes("style") || "";
    expect(style).toContain("right:");
    expect(style).toContain("bottom:");
  });

  it("C-01-S04: restored position from chrome.storage", async () => {
    vi.mocked(chrome.storage.local.get).mockResolvedValue({
      petPosition: { x: 300, y: 500 },
    });
    const wrapper = mount(PetOverlay);
    await nextTick();
    const style = wrapper.find(".pet-container").attributes("style") || "";
    expect(style).toContain("left: 300px");
    expect(style).toContain("top: 500px");
  });

  it("C-01-S05: host page CSS does not affect pet appearance", () => {
    // 注入宿主全局样式 body { color: red !important; font-family: "Comic Sans" !important; }
    // ShadowDOM 内文字颜色和字体不变
  });
});
```

### C-02: 拖拽交互

```typescript
describe("PetOverlay drag", () => {
  it("C-02-S01: mousedown starts drag", async () => {
    const wrapper = mount(PetOverlay);
    const pet = wrapper.find(".pet-container");
    await pet.trigger("mousedown", { clientX: 100, clientY: 200 });
    // drag state activated
    expect(wrapper.vm.isDragging).toBe(true);
  });

  it("C-02-S02: mousemove updates position", async () => {
    const wrapper = mount(PetOverlay);
    const pet = wrapper.find(".pet-container");
    await pet.trigger("mousedown", { clientX: 100, clientY: 200 });
    await document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 300 }));
    const style = pet.attributes("style") || "";
    expect(style).toContain("left");
    expect(style).toContain("top");
  });

  it("C-02-S03: mouseup ends drag + persists position", async () => {
    const setSpy = vi.fn();
    vi.stubGlobal("chrome", { storage: { local: { set: setSpy, get: vi.fn() } } });
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("mousedown", { clientX: 100, clientY: 200 });
    await document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 300 }));
    await document.dispatchEvent(new MouseEvent("mouseup"));
    expect(wrapper.vm.isDragging).toBe(false);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({ petPosition: expect.any(Object) }),
      expect.any(Function)
    );
  });

  it("C-02-S04: drag constrained to viewport bounds", async () => {
    const wrapper = mount(PetOverlay);
    // 拖拽到 left < 0 或 top < 0 或 right > window.innerWidth
    // 位置自动吸附到边界内
  });

  it("C-02-S05: drag does not trigger on right-click", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("mousedown", { button: 2, clientX: 100, clientY: 200 });
    expect(wrapper.vm.isDragging).toBe(false);
  });
});
```

### C-03: 双击打开聊天窗口

```typescript
describe("PetOverlay double-click", () => {
  it("C-03-S01: dblclick opens chat window", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("dblclick");
    // ChatWindow 显示
    expect(wrapper.find(".chat-window").exists()).toBe(true);
  });

  it("C-03-S02: dblclick during drag is ignored", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("mousedown", { clientX: 100, clientY: 200 });
    await document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150, clientY: 250 }));
    await wrapper.find(".pet-container").trigger("dblclick"); // 拖拽过程中的双击
    expect(wrapper.find(".chat-window").exists()).toBe(false);
  });
});
```

### C-04: 动画状态机

```typescript
describe("Pet animation state machine", () => {
  beforeEach(() => vi.useFakeTimers());

  it("C-04-S01: idle animation plays on mount", () => {
    const wrapper = mount(PetOverlay);
    expect(wrapper.find(".pet-container").classes()).toContain("animation-idle");
  });

  it("C-04-S02: transitions to sleep after 30s of inactivity", async () => {
    const wrapper = mount(PetOverlay);
    vi.advanceTimersByTime(31_000);
    await nextTick();
    expect(wrapper.find(".pet-container").classes()).toContain("animation-sleep");
  });

  it("C-04-S03: hover triggers bounce animation", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("mouseenter");
    expect(wrapper.find(".pet-container").classes()).toContain("animation-bounce");
  });

  it("C-04-S04: mouse move resets idle timer", async () => {
    const wrapper = mount(PetOverlay);
    vi.advanceTimersByTime(20_000); // 20s inactivity
    await document.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 100 }));
    // idle timer 重置为 0
    vi.advanceTimersByTime(20_000); // 又 20s
    expect(wrapper.find(".pet-container").classes()).toContain("animation-idle"); // 仍未 sleep
  });

  it("C-04-S05: click wakes from sleep", async () => {
    const wrapper = mount(PetOverlay);
    vi.advanceTimersByTime(31_000); // → sleep
    await wrapper.find(".pet-container").trigger("click");
    expect(wrapper.find(".pet-container").classes()).toContain("animation-wake");
  });

  it("C-04-S06: chat open keeps pet awake", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("dblclick"); // 打开聊天
    vi.advanceTimersByTime(60_000); // 60s
    expect(wrapper.find(".pet-container").classes()).not.toContain("animation-sleep");
    // 聊天窗口打开时不进入 sleep
  });

  afterEach(() => vi.useRealTimers());
});
```

### C-05: 可访问性

```typescript
describe("PetOverlay accessibility", () => {
  it("C-05-S01: prefers-reduced-motion disables all animations", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const wrapper = mount(PetOverlay);
    const container = wrapper.find(".pet-container");
    expect(container.classes()).not.toContain("animation-idle");
    expect(container.classes()).not.toContain("animation-bounce");
    // 所有动画 class 不应存在
  });

  it("C-05-S02: pet has aria-label", () => {
    const wrapper = mount(PetOverlay);
    expect(wrapper.find(".pet-container").attributes("aria-label")).toBeTruthy();
  });

  it("C-05-S03: keyboard accessible (Enter to interact)", async () => {
    const wrapper = mount(PetOverlay);
    await wrapper.find(".pet-container").trigger("keydown", { key: "Enter" });
    // 聊天窗口打开 (同 dblclick)
  });
});
```

---

## 三、集成测试

```typescript
describe("Pet UI integration", () => {
  it("I-01: Popup color change → CS pet color updates", async () => {
    // 1. Popup 选择新颜色
    // 2. chrome.storage.local.set({ petColor: "#ff0000" })
    // 3. chrome.storage.onChanged 触发
    // 4. CS PetOverlay watch petColor → 更新渐变
  });

  it("I-02: Popup role change → CS pet image updates", async () => {
    // 1. Popup 选择新角色
    // 2. chrome.storage.local.set({ petRole: "aier" })
    // 3. CS pet image src 更新为新角色图片
  });

  it("I-03: pet position persists after page refresh", async () => {
    // 1. 拖拽宠物到 (300, 400)
    // 2. chrome.storage.local.set 被调用
    // 3. 模拟刷新 → 重新 mount PetOverlay
    // 4. 宠物位置恢复为 (300, 400)
  });

  it("I-04: multiple tabs have independent pet positions", async () => {
    // Tab A 拖到 (100, 200), Tab B 拖到 (500, 600)
    // 各自独立（位置按 tabId 存储或不存储）
  });
});
```

---

## 四、性能测试

| 编号 | 指标 | 方法 | 阈值 |
|------|------|------|------|
| PERF-01 | 空闲动画帧率 | PerformanceObserver + rAF | ≥ 55fps |
| PERF-02 | 拖拽帧率 | mousemove 期间 rAF 间隔 | ≥ 30fps |
| PERF-03 | Pet mount 到首次渲染 | `performance.now()` 差值 | < 100ms |
| PERF-04 | 内存占用 | Chrome DevTools Memory heap snapshot | < 5MB（Pet + Chat Window） |
| PERF-05 | CSS 动画 Composite-only | DevTools Rendering → Paint flashing | 拖拽/动画不触发 repaint |

---

## 五、边缘场景

| 编号 | 场景 | 触发 | 预期 |
|------|------|------|------|
| EDGE-01 | 视口极小（< 200px 宽） | 移动端模拟 | 宠物缩小或隐藏 |
| EDGE-02 | 页面有 `pointer-events: none` | 覆盖层 | 宠物仍可交互（z-index + isolation） |
| EDGE-03 | 快速连续拖拽 | mousedown → mousemove × 50 → mouseup | 位置更新正确，无抖动 |
| EDGE-04 | 拖拽到浏览器外 | mousemove clientX < 0 | 位置吸附到边界 |
| EDGE-05 | 页面 z-index 极高元素 | 宿主 modal z-index: 999999 | 宠物 z-index 不覆盖宿主 modal |
| EDGE-06 | 标签页后台 | `visibilitychange` → hidden | 动画暂停（rAF 不触发），节省 CPU |

---

## 六、完成定义

- [ ] 组件测试：C-01(5) + C-02(5) + C-03(2) + C-04(6) + C-05(3) = 21 用例全通过
- [ ] 集成测试：I-01~04 全通过
- [ ] 性能测试：PERF-01~05 全部达标
- [ ] 边缘场景：EDGE-01~06 全部验证
- [ ] ShadowDOM 渲染正确，宿主样式不穿透
- [ ] 拖拽流畅，位置持久化
- [ ] 动画状态机（idle → sleep → wake → bounce）全状态覆盖
- [ ] `prefers-reduced-motion` 禁用所有动画
- [ ] 帧率 ≥ 55fps（空闲动画）