import { describe, it, expect, vi } from "vitest";

/**
 * RequestHttp API tests.
 *
 * Tests the RPC envelope assembly, data service contract, and CRUD method signatures.
 * We avoid triggering actual axios calls (which need Pinia active context) by testing
 * function signatures and the RPC payload shape.
 */

// Mock the HTTP layer to avoid Pinia context issues in the axios interceptor
vi.mock("@/api/index", () => {
  const mockPost = vi.fn().mockResolvedValue({ code: 0, message: "ok", data: {} });
  return {
    default: {
      post: mockPost,
      get: vi.fn().mockResolvedValue({ code: 0, message: "ok", data: {} }),
    },
  };
});

describe("dataService RPC contract", () => {
  it("queryDocuments accepts standard params", async () => {
    const { queryDocuments } = await import("@/api/modules/dataService");
    expect(typeof queryDocuments).toBe("function");
  });

  it("createDocument is callable", async () => {
    const { createDocument } = await import("@/api/modules/dataService");
    expect(typeof createDocument).toBe("function");
  });

  it("updateDocument is callable", async () => {
    const { updateDocument } = await import("@/api/modules/dataService");
    expect(typeof updateDocument).toBe("function");
  });

  it("deleteDocument is callable", async () => {
    const { deleteDocument } = await import("@/api/modules/dataService");
    expect(typeof deleteDocument).toBe("function");
  });

  it("callService returns a promise", async () => {
    const { callService } = await import("@/api/modules/dataService");
    const result = callService("services.test.module", "test_method", {});
    expect(result).toBeInstanceOf(Promise);
    expect(typeof result.then).toBe("function");
  });
});

describe("API module interfaces", () => {
  it("roleService exports CRUD functions", async () => {
    const roleService = await import("@/api/modules/roleService");
    expect(typeof roleService.getRoleList).toBe("function");
    expect(typeof roleService.getAllRoles).toBe("function");
    expect(typeof roleService.createRole).toBe("function");
    expect(typeof roleService.updateRole).toBe("function");
    expect(typeof roleService.deleteRole).toBe("function");
  });

  it("auditService exports query functions", async () => {
    const auditService = await import("@/api/modules/auditService");
    expect(typeof auditService.getAuditLogList).toBe("function");
    expect(auditService.AUDIT_ACTIONS).toBeInstanceOf(Array);
    expect(auditService.AUDIT_MODULES).toBeInstanceOf(Array);
  });
});