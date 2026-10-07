import { describe, it, expect, vi } from "vitest";
import { createTranslationService, type TranslationService, type TranslateResult, type TranslateParams } from "@/api/services/translation";
import type { ApiClient } from "@/api/client";

function mockClient(): ApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    rpc: vi.fn(),
    stream: vi.fn(),
    url: (path: string) => `http://localhost:10086${path}`,
  } as unknown as ApiClient;
}

describe("TranslationService", () => {
  describe("factory function", () => {
    it("creates service with translate, queryHistory, feedback methods", () => {
      const client = mockClient();
      const svc = createTranslationService(client);
      expect(typeof svc.translate).toBe("function");
      expect(typeof svc.queryHistory).toBe("function");
      expect(typeof svc.feedback).toBe("function");
    });
  });

  describe("translate", () => {
    it("calls RPC with correct module and method", async () => {
      const client = mockClient();
      (client.rpc as any).mockResolvedValue({
        ok: true,
        status: 200,
        data: [{ provider: "openai", text: "你好" }],
      });
      const svc = createTranslationService(client);
      const result = await svc.translate({ text: "Hello", to_lang: "zh" });
      expect(result).toEqual([{ provider: "openai", text: "你好" }]);
      expect(client.rpc).toHaveBeenCalledWith(
        "services.translation.translate_service",
        "translate",
        expect.objectContaining({ text: "Hello", to_lang: "zh" }),
      );
    });

    it("defaults use_memory to true", async () => {
      const client = mockClient();
      (client.rpc as any).mockResolvedValue({ ok: true, status: 200, data: [] });
      const svc = createTranslationService(client);
      await svc.translate({ text: "test" });
      expect(client.rpc).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ use_memory: true }),
      );
    });

    it("throws on RPC error", async () => {
      const client = mockClient();
      (client.rpc as any).mockResolvedValue({ ok: false, status: 500, error: "Server error", data: null });
      const svc = createTranslationService(client);
      await expect(svc.translate({ text: "test" })).rejects.toThrow("Server error");
    });
  });

  describe("queryHistory", () => {
    it("queries translation_records collection", async () => {
      const client = mockClient();
      (client.rpc as any).mockResolvedValue({
        ok: true, status: 200,
        data: { list: [], total: 0 },
      });
      const svc = createTranslationService(client);
      const result = await svc.queryHistory({ pageSize: 10 });
      expect(result.total).toBe(0);
      expect(client.rpc).toHaveBeenCalledWith(
        "services.database.data_service",
        "query_documents",
        expect.objectContaining({ cname: "translation_records" }),
      );
    });
  });

  describe("feedback", () => {
    it("submits good rating", async () => {
      const client = mockClient();
      (client.rpc as any).mockResolvedValue({
        ok: true, status: 200, data: { success: true },
      });
      const svc = createTranslationService(client);
      const result = await svc.feedback({
        source: "Hello", target: "你好", rating: "good", provider: "openai",
      });
      expect(result.success).toBe(true);
      expect(client.rpc).toHaveBeenCalledWith(
        "services.translation.translate_service",
        "translation_feedback",
        expect.objectContaining({ rating: "good" }),
      );
    });
  });
});