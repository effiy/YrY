import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock storage utilities
vi.mock("@/utils/storage", () => ({
  loadJson: vi.fn((_key: string, fallback: unknown) => fallback),
  saveJson: vi.fn(),
}));

describe("usePromptTemplates", () => {
  it("adds a template", async () => {
    const { usePromptTemplates } = await import("@/views/ai-chat/composables/usePromptTemplates");
    const { promptTemplates, addTemplate } = usePromptTemplates();
    const ok = addTemplate("test", "Hello {{name}}");
    expect(ok).toBe(true);
    expect(promptTemplates.value).toHaveLength(1);
    expect(promptTemplates.value[0].name).toBe("test");
  });

  it("rejects duplicate template names", async () => {
    const { usePromptTemplates } = await import("@/views/ai-chat/composables/usePromptTemplates");
    const { addTemplate } = usePromptTemplates();
    addTemplate("dup", "content");
    const ok = addTemplate("dup", "other");
    expect(ok).toBe(false);
  });

  it("applies template with variables", async () => {
    const { usePromptTemplates } = await import("@/views/ai-chat/composables/usePromptTemplates");
    const { promptTemplates, addTemplate, applyTemplate } = usePromptTemplates();
    addTemplate("greet", "Hello $1, welcome to $2");
    const result = applyTemplate("greet", ["World", "YiVad"]);
    expect(result).toBe("Hello World, welcome to YiVad");
  });

  it("removes a template", async () => {
    const { usePromptTemplates } = await import("@/views/ai-chat/composables/usePromptTemplates");
    const { promptTemplates, addTemplate, removeTemplate } = usePromptTemplates();
    addTemplate("temp", "x");
    expect(promptTemplates.value).toHaveLength(1);
    removeTemplate("temp");
    expect(promptTemplates.value).toHaveLength(0);
  });

  it("applyTemplate returns null for unknown template", async () => {
    const { usePromptTemplates } = await import("@/views/ai-chat/composables/usePromptTemplates");
    const { applyTemplate } = usePromptTemplates();
    expect(applyTemplate("nonexistent", [])).toBeNull();
  });
});