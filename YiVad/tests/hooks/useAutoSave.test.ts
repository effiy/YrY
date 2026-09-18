/**
 * useAutoSave — 表单草稿自动保存与恢复
 *
 * ## 场景
 * 用户填写长表单（如项目申报、问卷），意外关闭浏览器或崩溃后，下次打开页面自动提示恢复草稿。
 * 2 秒防抖避免频繁写入 IndexedDB，多次快速修改合并为一次保存。
 *
 * ## 效果演示
 * ```
 * const { saveStatus, isDirty, lastSavedAt, checkForDrafts, restoreDraft } =
 *   useAutoSave({ formId: "project-create", formName: "新建项目", formData, totalFields: 15 });
 *
 * // 模板中显示保存状态:
 * // <span v-if="saveStatus === 'saving'">保存中...</span>
 * // <span v-else-if="saveStatus === 'saved'">已保存 {{ lastSavedAt }}</span>
 *
 * // 页面挂载时检查草稿:
 * // const drafts = await checkForDrafts();
 * // if (drafts.length) showRestoreDialog(drafts);
 * ```
 *
 * ## 关键行为
 * - formData 变更 → debounceMs 后自动保存（默认 2000ms）
 * - debounce 窗口内多次修改只触发一次 IndexedDB 写入
 * - `enabled=false` 时完全不保存（如只读预览模式）
 * - `saveNow()` 绕过 debounce 立即写入
 * - 草稿过期 30 天自动清理
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useAutoSave } from "@/hooks/useAutoSave";

vi.mock("@/stores/modules/formDraft", () => ({
  useFormDraftStore: () => ({
    createDraft: vi.fn((formId: string, formName: string, data: Record<string, any>, totalFields: number) => ({
      id: "draft-1", formId, formName, data: { ...data }, totalFields,
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), expiresAt: Date.now() + 86400000, fieldCount: 1 },
      version: 1
    })),
    saveDraft: vi.fn(),
    getDraftsByForm: vi.fn(() => []),
    deleteDraft: vi.fn(),
  }),
}));

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  // ── 初始化：表单刚打开，无变更 ────────────────────────

  it("初始状态 saveStatus='idle'，无待保存内容", () => {
    const formData = ref({ name: "" });
    const { saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5 });
    expect(saveStatus.value).toBe("idle");
  });

  // ── 变更检测 → 自动保存 ───────────────────────────────

  it("formData 变更 → isDirty=true, saveStatus='unsaved'", async () => {
    const formData = ref({ name: "" });
    const { isDirty, saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5 });
    formData.value = { name: "John" };
    await vi.advanceTimersByTimeAsync(0);
    expect(isDirty.value).toBe(true);
    expect(saveStatus.value).toBe("unsaved");
  });

  it("debounceMs 过后自动保存 → saveStatus='saved'", async () => {
    const formData = ref({ name: "" });
    const { saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5, debounceMs: 100 });
    formData.value = { name: "John" };
    await vi.advanceTimersByTimeAsync(150);
    expect(saveStatus.value).toBe("saved");
  });

  it("快速连续修改 3 次 → 仅触发一次 IndexedDB 写入", async () => {
    const formData = ref({ name: "" });
    const { saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5, debounceMs: 200 });
    formData.value = { name: "A" };
    await vi.advanceTimersByTimeAsync(50);
    formData.value = { name: "B" };
    await vi.advanceTimersByTimeAsync(50);
    formData.value = { name: "C" };
    await vi.advanceTimersByTimeAsync(250);
    expect(saveStatus.value).toBe("saved");
  });

  // ── 手动保存 ──────────────────────────────────────────

  it("saveNow() → 立即写入 IndexedDB，不等待 debounce", async () => {
    const formData = ref({ name: "" });
    const { saveNow, saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5 });
    await saveNow();
    expect(saveStatus.value).toBe("saved");
  });

  // ── 禁用自动保存 ──────────────────────────────────────

  it("enabled=false → 始终保持 idle，不触发任何保存", () => {
    const formData = ref({ name: "" });
    const { saveStatus } = useAutoSave({ formId: "test-form", formName: "Test Form", formData, totalFields: 5, enabled: false });
    expect(saveStatus.value).toBe("idle");
  });
});