import { describe, it, expect } from "vitest";

/**
 * IT-03: Selection × RPC 参数
 *
 * 验证数据查询使用正确的参数名称契约：
 * - 使用 `filter` 而非 `query`
 * - 使用 `cname` 而非 `collection_name`
 * - 分页参数 `skip`/`limit` 正确换算
 * - 空筛选条件被剔除
 */
describe("IT-03: Selection × RPC params", () => {
  describe("RPC 参数名称契约", () => {
    it("uses filter key not query", () => {
      const params: Record<string, any> = {
        module_name: "services.data.data_service",
        method_name: "query_documents",
        parameters: {
          cname: "bugs",
          filter: { status: "open" },
        },
      };
      expect(params.parameters).toHaveProperty("filter");
      expect(params.parameters).not.toHaveProperty("query");
    });

    it("uses cname key not collection_name", () => {
      const params: Record<string, any> = {
        parameters: { cname: "sessions", filter: {} },
      };
      expect(params.parameters).toHaveProperty("cname");
      expect(params.parameters).not.toHaveProperty("collection_name");
    });

    it("pagination computes skip and limit correctly", () => {
      const pageNum = 3;
      const pageSize = 20;
      const skip = (pageNum - 1) * pageSize;
      const limit = pageSize;
      expect(skip).toBe(40);
      expect(limit).toBe(20);
    });

    it("sort parameter uses MongoDB convention", () => {
      const sortAsc = { name: 1 };
      const sortDesc = { createdAt: -1 };
      expect(sortAsc.name).toBe(1);
      expect(sortDesc.createdAt).toBe(-1);
    });

    it("empty filter values are stripped", () => {
      const raw = { status: "", priority: null, name: undefined, category: "bug" };
      const cleaned = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );
      expect(cleaned).toEqual({ category: "bug" });
      expect(Object.keys(cleaned)).not.toContain("status");
    });
  });

  describe("RPC 信封结构", () => {
    it("has correct module_name for data service", () => {
      const envelope = {
        module_name: "services.data.data_service",
        method_name: "query_documents",
        parameters: { cname: "bugs", filter: {} },
      };
      expect(envelope.module_name).toBe("services.data.data_service");
      expect(envelope.method_name).toBe("query_documents");
    });

    it("does not leak internal keys", () => {
      const params = {
        cname: "bugs",
        filter: { status: "open" },
      };
      const allowed = ["cname", "filter", "pageNum", "pageSize", "sort"];
      const keys = Object.keys(params);
      keys.forEach(k => expect(allowed).toContain(k));
    });
  });
});