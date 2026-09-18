/**
 * formDraft store 测试
 *
 * 验证范围：
 * - 草稿 CRUD（创建、保存、查询、删除）
 * - localStorage 持久化与恢复
 * - 过期草稿自动清理
 * - 腐败数据降级处理
 * - formId 隔离
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useFormDraftStore, type FormDraft } from "@/stores/modules/formDraft";

function makeStore() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return useFormDraftStore();
}

function buildDraft(overrides: Partial<FormDraft> = {}): FormDraft {
  return {
    id: "draft-test-001",
    formId: "form-contact",
    formName: "Contact Form",
    data: { name: "Alice", email: "alice@example.com" },
    totalFields: 5,
    metadata: {
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      fieldCount: 2
    },
    version: 1,
    ...overrides
  };
}

describe("formDraft store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── createDraft ──────────────────────────────────────

  describe("createDraft", () => {
    it("creates draft with correct shape", () => {
      const store = makeStore();
      const draft = store.createDraft("form-a", "Form A", { x: 1 }, 10);

      expect(draft.formId).toBe("form-a");
      expect(draft.formName).toBe("Form A");
      expect(draft.data).toEqual({ x: 1 });
      expect(draft.totalFields).toBe(10);
      expect(draft.id).toMatch(/^draft-/);
      expect(draft.version).toBe(1);
      expect(draft.metadata.createdAt).toBeGreaterThan(0);
      expect(draft.metadata.expiresAt).toBeGreaterThan(draft.metadata.createdAt);
    });

    it("generates unique IDs for each draft", () => {
      const store = makeStore();
      const a = store.createDraft("f", "F", {}, 3);
      const b = store.createDraft("f", "F", {}, 3);
      expect(a.id).not.toBe(b.id);
    });

    it("computes fieldCount from non-empty values", () => {
      const store = makeStore();
      // filter: v !== null && v !== undefined && v !== "" — "x" and 0 pass, but ""/null/undefined are excluded
      const draft = store.createDraft("f", "F", { a: "x", b: "", c: null, d: undefined, e: 0 }, 5);
      expect(draft.metadata.fieldCount).toBe(2); // "x" and 0
    });

    it("sets expiry to 30 days from now", () => {
      const store = makeStore();
      const now = Date.now();
      const draft = store.createDraft("f", "F", {}, 1);
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      expect(draft.metadata.expiresAt - draft.metadata.createdAt).toBe(thirtyDays);
    });

    it("accepts currentStep parameter", () => {
      const store = makeStore();
      const draft = store.createDraft("f", "F", {}, 3, 2);
      expect(draft.currentStep).toBe(2);
    });
  });

  // ── saveDraft ────────────────────────────────────────

  describe("saveDraft", () => {
    it("persists draft to localStorage", async () => {
      const store = makeStore();
      const draft = buildDraft();
      await store.saveDraft(draft);

      const raw = localStorage.getItem("yivad-form-draft-draft-test-001");
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.formId).toBe("form-contact");
    });

    it("adds new draft to state", async () => {
      const store = makeStore();
      expect(store.drafts).toHaveLength(0);
      await store.saveDraft(buildDraft());
      expect(store.drafts).toHaveLength(1);
    });

    it("updates existing draft in state", async () => {
      const store = makeStore();
      await store.saveDraft(buildDraft());
      const updated = buildDraft({ data: { name: "Bob" } });
      await store.saveDraft(updated);

      expect(store.drafts).toHaveLength(1);
      expect(store.drafts[0].data.name).toBe("Bob");
    });

    it("updates metadata.updatedAt on save", async () => {
      const store = makeStore();
      const draft = buildDraft();
      const original = draft.metadata.updatedAt;
      await new Promise(r => setTimeout(r, 10));
      await store.saveDraft(draft);
      expect(draft.metadata.updatedAt).toBeGreaterThan(original);
    });

    it("recalculates fieldCount on save", async () => {
      const store = makeStore();
      const draft = buildDraft({ data: { a: "1", b: "2", c: "3", d: "" } });
      await store.saveDraft(draft);
      expect(draft.metadata.fieldCount).toBe(3);
    });
  });

  // ── getDraftsByForm ──────────────────────────────────

  describe("getDraftsByForm", () => {
    it("returns drafts for the given formId sorted by updatedAt desc", async () => {
      const store = makeStore();
      const d1 = buildDraft({ id: "d-1" });
      const d2 = buildDraft({ id: "d-2" });
      const d3 = buildDraft({ id: "d-3", formId: "form-other" });

      await store.saveDraft(d1);
      // Small delay so d-2 has a newer updatedAt
      await new Promise(r => setTimeout(r, 5));
      await store.saveDraft(d2);
      await store.saveDraft(d3);

      const results = store.getDraftsByForm("form-contact");
      expect(results).toHaveLength(2);
      // d-2 was saved last, so it has the newest updatedAt → first
      expect(results[0].id).toBe("d-2");
      expect(results[1].id).toBe("d-1");
    });

    it("excludes expired drafts", async () => {
      const store = makeStore();
      const expired = buildDraft({
        id: "expired",
        metadata: { ...buildDraft().metadata, expiresAt: Date.now() - 1000 }
      });
      await store.saveDraft(expired);
      await store.saveDraft(buildDraft({ id: "valid" }));

      expect(store.getDraftsByForm("form-contact")).toHaveLength(1);
      expect(store.getDraftsByForm("form-contact")[0].id).toBe("valid");
    });

    it("returns empty array for unknown formId", () => {
      const store = makeStore();
      expect(store.getDraftsByForm("nonexistent")).toEqual([]);
    });
  });

  // ── getDraft ─────────────────────────────────────────

  describe("getDraft", () => {
    it("finds draft by id", async () => {
      const store = makeStore();
      await store.saveDraft(buildDraft({ id: "target" }));
      expect(store.getDraft("target")?.id).toBe("target");
    });

    it("returns undefined for unknown id", () => {
      const store = makeStore();
      expect(store.getDraft("missing")).toBeUndefined();
    });
  });

  // ── deleteDraft ──────────────────────────────────────

  describe("deleteDraft", () => {
    it("removes from localStorage and state", async () => {
      const store = makeStore();
      await store.saveDraft(buildDraft({ id: "to-delete" }));
      expect(store.drafts).toHaveLength(1);

      await store.deleteDraft("to-delete");
      expect(store.drafts).toHaveLength(0);
      expect(localStorage.getItem("yivad-form-draft-to-delete")).toBeNull();
    });

    it("is a no-op for non-existent draft", async () => {
      const store = makeStore();
      await store.saveDraft(buildDraft());
      await store.deleteDraft("nonexistent");
      expect(store.drafts).toHaveLength(1);
    });
  });

  // ── cleanExpiredDrafts ───────────────────────────────

  describe("cleanExpiredDrafts", () => {
    it("removes expired drafts and returns count", async () => {
      const store = makeStore();
      const meta = buildDraft().metadata;
      await store.saveDraft(buildDraft({ id: "fresh", metadata: { ...meta, expiresAt: Date.now() + 999999 } }));
      await store.saveDraft(buildDraft({ id: "stale-1", metadata: { ...meta, expiresAt: Date.now() - 100 } }));
      await store.saveDraft(buildDraft({ id: "stale-2", metadata: { ...meta, expiresAt: Date.now() - 200 } }));

      const removed = store.cleanExpiredDrafts();
      expect(removed).toBe(2);
      expect(store.drafts).toHaveLength(1);
      expect(store.drafts[0].id).toBe("fresh");
      expect(localStorage.getItem("yivad-form-draft-stale-1")).toBeNull();
      expect(localStorage.getItem("yivad-form-draft-stale-2")).toBeNull();
    });

    it("returns 0 when no expired drafts", () => {
      const store = makeStore();
      expect(store.cleanExpiredDrafts()).toBe(0);
    });
  });

  // ── loadAllDrafts (tested via init) ──────────────────

  describe("loadAllDrafts — corrupt data handling", () => {
    it("survives corrupt localStorage without throwing", () => {
      // Write a corrupt entry using the store's key prefix
      localStorage.setItem("yivad-form-draft-corrupt", "{ not valid ### }");
      // Creating the store triggers loadAllDrafts internally
      const store = makeStore();
      // Corrupt entries are filtered out by .filter(Boolean) after JSON.parse fails
      expect(store.drafts.filter(d => d.id === "corrupt")).toEqual([]);
    });

    it("store drafts ref tracks all saved drafts", async () => {
      const store = makeStore();
      await store.saveDraft(buildDraft({ id: "d-1" }));
      await store.saveDraft(buildDraft({ id: "d-2" }));
      await store.saveDraft(buildDraft({ id: "d-3", formId: "other" }));

      // All drafts are tracked in the reactive array
      expect(store.drafts).toHaveLength(3);
      expect(store.drafts.map(d => d.id).sort()).toEqual(["d-1", "d-2", "d-3"]);
    });
  });
});