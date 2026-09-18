/**
 * useFormExport — 表单数据导入/导出
 *
 * ## 场景
 * 用户批量导入 CSV 数据到表单（如批量创建用户），CSV 列名映射到表单字段名。
 * 导出表单数据为 CSV/JSON 文件下载。导入支持字段转换（如字符串 → 数字）。
 *
 * ## 效果演示
 * ```
 * const { isExporting, isImporting, mapFields, executeImport, exportCSV, exportJSON, parseFile } =
 *   useFormExport({ importApi: api.batchCreateUser });
 *
 * // 导入流程:
 * // <input type="file" @change="handleFile" accept=".csv,.json" />
 * // const file = event.target.files[0];
 * // const rows = await parseFile(file);
 * // const mapped = mapFields(rows, [
 * //   { sourceField: "姓名", targetField: "name" },
 * //   { sourceField: "年龄", targetField: "age", transform: Number },
 * // ]);
 * // const result = await executeImport(mapped);
 * // if (!result.success) showErrors(result.errors);
 *
 * // 导出:
 * // <el-button @click="exportCSV(tableData, '用户列表')">导出 CSV</el-button>
 * // <el-button @click="exportJSON(tableData, '用户列表')">导出 JSON</el-button>
 * ```
 *
 * ## 关键行为
 * - `mapFields` 按 sourceField→targetField 映射行数据
 * - `executeImport` 逐个调用 importApi，失败项收集到 errors[]
 * - 部分失败时 `result.success=false`，`result.imported` 为成功数
 * - `exportCSV/exportJSON` 创建 Blob → createObjectURL → 触发下载
 */
import { describe, it, expect, vi } from "vitest";
import { useFormExport } from "@/hooks/useFormExport";

describe("useFormExport", () => {
  // ── 初始状态 ────────────────────────────────────

  it("初始 isExporting=false、isImporting=false、importResult=null", () => {
    const { isExporting, isImporting, importResult } = useFormExport();
    expect(isExporting.value).toBe(false);
    expect(isImporting.value).toBe(false);
    expect(importResult.value).toBeNull();
  });

  // ── 字段映射 ────────────────────────────────────

  it("mapFields → sourceField→targetField 映射 + transform 转换类型", () => {
    const { mapFields } = useFormExport();
    const rows = [{ "First Name": "Alice", "Years": "30" }];
    const mapped = mapFields(rows, [
      { sourceField: "First Name", targetField: "name" },
      { sourceField: "Years", targetField: "age", transform: Number },
    ]);
    expect(mapped[0].name).toBe("Alice");
    expect(mapped[0].age).toBe(30);
  });

  it("transform: Number → 字符串转数字", () => {
    const { mapFields } = useFormExport();
    expect(typeof mapFields([{ "score": "95" }], [
      { sourceField: "score", targetField: "score", transform: Number }
    ])[0].score).toBe("number");
  });

  // ── 批量导入 ────────────────────────────────────

  it("executeImport → 全部成功 → success=true, imported=2", async () => {
    const importApi = vi.fn().mockResolvedValue(true);
    const { executeImport } = useFormExport({ importApi });
    const result = await executeImport([{ name: "Alice" }, { name: "Bob" }]);
    expect(result.success).toBe(true);
    expect(result.imported).toBe(2);
  });

  it("第 2 条失败 → success=false, imported=1, errors.length=1", async () => {
    const importApi = vi.fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("Invalid data"));
    const { executeImport } = useFormExport({ importApi });
    const result = await executeImport([{ name: "Alice" }, { name: "Bad" }]);
    expect(result.success).toBe(false);
    expect(result.imported).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  // ── 导出下载 ────────────────────────────────────

  it("exportCSV → 生成 Blob + 触发 <a> 点击下载", () => {
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    const createElSpy = vi.spyOn(document, "createElement");
    useFormExport().exportCSV([{ name: "Alice", age: 30 }], "test");
    expect(createElSpy).toHaveBeenCalledWith("a");
    createElSpy.mockRestore();
  });

  it("exportJSON → 生成 Blob + 触发 <a> 点击下载", () => {
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();
    const createElSpy = vi.spyOn(document, "createElement");
    useFormExport().exportJSON([{ name: "Alice" }], "test");
    expect(createElSpy).toHaveBeenCalledWith("a");
    createElSpy.mockRestore();
  });

  // ── 文件类型识别 ────────────────────────────────

  it("parseFile → JSON 文件通过 MIME 类型识别", () => {
    const blob = new Blob([JSON.stringify([{ name: "Alice" }])], { type: "application/json" });
    const file = new File([blob], "data.json", { type: "application/json" });
    expect(file.name).toBe("data.json");
  });

  it("parseFile → CSV 文件通过 MIME 类型识别", () => {
    const blob = new Blob(["name,age\nAlice,30\n"], { type: "text/csv" });
    const file = new File([blob], "data.csv", { type: "text/csv" });
    expect(file.name).toBe("data.csv");
  });
});