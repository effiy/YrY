---

doc_type: test
title: "YP-09-07: 国际化 — MessageKey 类型安全 + t() 回退 + 语言热切换 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-07"
source_prds: ["14-功能实现-国际化与多语言支持"]
source_modules: ["07-prd-task-国际化"]

type: test
---

# YP-09-07: 国际化 — 测试规格

## 一、单元测试

```typescript
describe("i18n", () => {
  it("U-01: t() returns translation for current locale", () => {
    currentLocale.value = "zh_CN";
    expect(t("sendButton")).toBe("发送");
  });

  it("U-02: t() falls back to en when locale missing", () => {
    currentLocale.value = "fr"; // unsupported
    expect(t("sendButton")).toBe("Send"); // en fallback
  });

  it("U-03: t() returns key itself when all locales missing", () => {
    expect(t("nonexistentKey" as any)).toBe("nonexistentKey");
  });

  it("U-04: invalid key causes TypeScript compile error", () => {
    // t("invalidKey") → tsc error: Argument of type '"invalidKey"' not assignable
    // 编译时验证，非运行时
  });

  it("U-05: localizeDOM replaces [data-i18n] textContent", () => {
    document.body.innerHTML = '<span data-i18n="sendButton">Old</span>';
    localizeDOM();
    expect(document.querySelector("[data-i18n]")!.textContent).toBe("Send");
  });

  it("U-06: language switch updates all UI without reload", async () => {
    currentLocale.value = "zh_CN";
    await nextTick();
    const wrapper = mount(ChatInput);
    expect(wrapper.find("button.send").text()).toBe("发送");

    currentLocale.value = "en";
    await nextTick();
    expect(wrapper.find("button.send").text()).toBe("Send");
  });

  it("U-07: en + zh_CN have all 79+ keys", () => {
    const enKeys = Object.keys(enMessages);
    const zhKeys = Object.keys(zhMessages);
    expect(enKeys.length).toBeGreaterThanOrEqual(79);
    expect(zhKeys.length).toBeGreaterThanOrEqual(79);
  });
});
```

## 二、完成定义

- [ ] U-01~07 全通过
- [ ] `tsc --noEmit` 零错误 (MessageKey 类型检查)