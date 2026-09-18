/**
 * useFormPersistence — 表单崩溃恢复与多标签同步
 *
 * ## 场景
 * 用户正在填写长表单，浏览器意外崩溃或关闭。下次打开同一页面时，自动检测并提示恢复上次未提交的数据。
 * 不同表单（不同 formId）的恢复数据完全隔离。
 *
 * ## 效果演示
 * ```
 * const { hasRecovery, checkRecovery, clearRecovery } =
 *   useFormPersistence({ formId: "order-create", formData });
 *
 * // 页面挂载时:
 * if (hasRecovery.value) {
 *   const recovery = checkRecovery();
 *   if (recovery) showDialog("检测到未提交数据，是否恢复？", recovery.data);
 * }
 *
 * // 提交成功后:
 * await submit();
 * clearRecovery(); // 清除恢复数据
 * ```
 *
 * ## 关键行为
 * - 使用 localStorage 作为轻量崩溃恢复存储（区别于 useAutoSave 的 IndexedDB）
 * - `checkRecovery()` 返回 `{ data, timestamp }` 或 null
 * - 损坏的 JSON 数据返回 null 而非抛出异常
 * - 不同 `formId` 的数据完全隔离
 */
import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { useFormPersistence } from "@/hooks/useFormPersistence";

describe("useFormPersistence", () => {
  beforeEach(() => { localStorage.clear(); });

  // ── 无保存数据时 ────────────────────────────────────

  it("无已保存数据 → hasRecovery=false", () => {
    const formData = ref({ name: "" });
    const { hasRecovery } = useFormPersistence({ formId: "test-form", formData });
    expect(hasRecovery.value).toBe(false);
  });

  // ── 检测与恢复 ──────────────────────────────────────

  it("localStorage 有有效数据 → checkRecovery 返回 { data, timestamp }", () => {
    const formData = ref({ name: "John" });
    localStorage.setItem("form-recovery-test-form", JSON.stringify({
      data: { name: "John" }, timestamp: Date.now()
    }));
    const { checkRecovery } = useFormPersistence({ formId: "test-form", formData });
    expect(checkRecovery()?.data.name).toBe("John");
  });

  // ── 清除恢复数据 ────────────────────────────────────

  it("clearRecovery → hasRecovery=false，localStorage 项被删除", () => {
    const formData = ref({ name: "" });
    localStorage.setItem("form-recovery-test-form", JSON.stringify({
      data: { name: "John" }, timestamp: Date.now()
    }));
    const { clearRecovery, hasRecovery } = useFormPersistence({ formId: "test-form", formData });
    clearRecovery();
    expect(hasRecovery.value).toBe(false);
    expect(localStorage.getItem("form-recovery-test-form")).toBeNull();
  });

  // ── 边界情况 ────────────────────────────────────────

  it("localStorage 数据损坏 → checkRecovery 返回 null（不抛异常）", () => {
    const formData = ref({ name: "" });
    localStorage.setItem("form-recovery-test-form", "{invalid json");
    const { checkRecovery } = useFormPersistence({ formId: "test-form", formData });
    expect(checkRecovery()).toBeNull();
  });

  it("不同 formId 的恢复数据完全隔离", () => {
    const formData1 = ref({ a: 1 });
    const formData2 = ref({ b: 2 });
    localStorage.setItem("form-recovery-form-a", JSON.stringify({ data: { a: 1 }, timestamp: Date.now() }));
    expect(useFormPersistence({ formId: "form-a", formData: formData1 }).checkRecovery()).not.toBeNull();
    expect(useFormPersistence({ formId: "form-b", formData: formData2 }).checkRecovery()).toBeNull();
  });
});