import { describe, it, expect, vi, beforeEach } from "vitest";
import { confirm, tryAction, confirmAndExecute, deleteConfirm, batchDeleteConfirm } from "@/hooks/useConfirmAction";

// Mock element-plus
vi.mock("element-plus", () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  ElMessageBox: {
    confirm: vi.fn()
  }
}));

import { ElMessage, ElMessageBox } from "element-plus";

describe("useConfirmAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("confirm", () => {
    it("returns true when user confirms", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      const result = await confirm("Delete this?", "Title", "warning");
      expect(result).toBe(true);
      expect(ElMessageBox.confirm).toHaveBeenCalledWith("Delete this?", "Title", { type: "warning" });
    });

    it("returns false when user cancels", async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce("cancel");
      const result = await confirm("Delete this?");
      expect(result).toBe(false);
    });

    it("defaults title to 'Confirm' and type to 'warning'", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      await confirm("Are you sure?");
      expect(ElMessageBox.confirm).toHaveBeenCalledWith("Are you sure?", "Confirm", { type: "warning" });
    });
  });

  describe("tryAction", () => {
    it("returns result on success", async () => {
      const result = await tryAction(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it("returns null and shows error on failure", async () => {
      const result = await tryAction(() => Promise.reject(new Error("Network error")));
      expect(result).toBeNull();
      expect(ElMessage.error).toHaveBeenCalledWith("Network error");
    });

    it("uses default error message for non-Error throws", async () => {
      const result = await tryAction(() => Promise.reject("string error"), "Custom error");
      expect(result).toBeNull();
      expect(ElMessage.error).toHaveBeenCalledWith("Custom error");
    });
  });

  describe("confirmAndExecute", () => {
    it("returns false when user cancels confirmation", async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce("cancel");
      const action = vi.fn().mockResolvedValue("done");
      const result = await confirmAndExecute("Proceed?", action);
      expect(result).toBe(false);
      expect(action).not.toHaveBeenCalled();
    });

    it("executes action and shows success message", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      const action = vi.fn().mockResolvedValue("done");
      const result = await confirmAndExecute("Proceed?", action, {
        successMessage: "Done!"
      });
      expect(result).toBe(true);
      expect(action).toHaveBeenCalledTimes(1);
      expect(ElMessage.success).toHaveBeenCalledWith("Done!");
    });

    it("returns false when action fails", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      const action = vi.fn().mockRejectedValue(new Error("Failed"));
      const result = await confirmAndExecute("Proceed?", action);
      expect(result).toBe(false);
      expect(ElMessage.error).toHaveBeenCalledWith("Failed");
    });
  });

  describe("deleteConfirm", () => {
    it("calls confirm with item name and type", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      await deleteConfirm("MyFile", "file");
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        expect.stringContaining("MyFile"),
        "Delete Confirmation",
        { type: "warning" }
      );
    });

    it("defaults item type to 'item'", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      await deleteConfirm("Something");
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        expect.stringContaining('item "Something"'),
        "Delete Confirmation",
        { type: "warning" }
      );
    });
  });

  describe("batchDeleteConfirm", () => {
    it("calls confirm with count", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      await batchDeleteConfirm(5, "users");
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        expect.stringContaining("5 users"),
        "Batch Delete",
        { type: "warning" }
      );
    });

    it("defaults item type to 'items'", async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce("confirm" as any);
      await batchDeleteConfirm(3);
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        expect.stringContaining("3 items"),
        "Batch Delete",
        { type: "warning" }
      );
    });
  });
});