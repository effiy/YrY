/**
 * useFormAccess — 字段级权限控制
 *
 * ## 场景
 * 财务审批表单：管理员可查看+编辑所有字段（含薪资），部门经理仅可查看不可编辑薪资字段，
 * 普通员工不可查看薪资字段。`isReadonly=true` 时整个表单不可编辑（如已归档单据）。
 *
 * ## 效果演示
 * ```
 * const { canViewField, canEditField, can, visibleFields, editableFields } =
 *   useFormAccess({ userRoles: currentUser.roles, isReadonly: form.status === 'archived', fieldRules: [
 *     { field: "salary", viewRoles: ["admin", "manager"], editRoles: ["admin"] },
 *   ], formPermissions: ["view", "edit"] });
 *
 * // 模板中:
 * // <el-form-item v-if="canViewField('salary')">
 * //   <el-input v-model="form.salary" :disabled="!canEditField('salary')" />
 * // </el-form-item>
 * // <el-button v-if="can('edit')" @click="save">保存</el-button>
 * ```
 *
 * ## 关键行为
 * - 无 fieldRules → 所有字段可查看、可编辑
 * - `canViewField` → 用户角色在 viewRoles 中或 viewRoles 为空
 * - `canEditField` → 用户角色在 editRoles 中或 editRoles 为空
 * - `isReadonly=true` → `canEditField` 始终返回 false
 * - `can(perm)` → 检查 `formPermissions` 数组包含
 */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useFormAccess } from "@/hooks/useFormAccess";

describe("useFormAccess", () => {
  // ── 无规则默认：所有字段可查看+编辑 ───────────────

  it("无 fieldRules → canViewField/canEditField 始终 true", () => {
    const userRoles = ref(["admin"]);
    const { canViewField, canEditField } = useFormAccess({ userRoles });
    expect(canViewField("any-field")).toBe(true);
    expect(canEditField("any-field")).toBe(true);
  });

  // ── 字段可见性 ──────────────────────────────────

  it("用户角色不在 viewRoles → canViewField 返回 false", () => {
    const userRoles = ref(["viewer"]);
    const { canViewField } = useFormAccess({
      userRoles,
      fieldRules: [{ field: "secret", viewRoles: ["admin"], editRoles: [] }]
    });
    expect(canViewField("secret")).toBe(false);
  });

  it("用户角色匹配 viewRoles → canViewField 返回 true", () => {
    const userRoles = ref(["admin"]);
    const { canViewField } = useFormAccess({
      userRoles,
      fieldRules: [{ field: "secret", viewRoles: ["admin"], editRoles: [] }]
    });
    expect(canViewField("secret")).toBe(true);
  });

  // ── 字段编辑权限 ────────────────────────────────

  it("用户角色不在 editRoles → canEditField 返回 false", () => {
    const userRoles = ref(["viewer"]);
    const { canEditField } = useFormAccess({
      userRoles,
      fieldRules: [{ field: "secret", viewRoles: [], editRoles: ["admin"] }]
    });
    expect(canEditField("secret")).toBe(false);
  });

  // ── 只读模式 ────────────────────────────────────

  it("isReadonly=true → 所有字段 canEditField 返回 false", () => {
    const userRoles = ref(["admin"]);
    const { canEditField } = useFormAccess({ userRoles, isReadonly: true, fieldRules: [] });
    expect(canEditField("any-field")).toBe(false);
  });

  // ── 表单级权限 ──────────────────────────────────

  it("can('edit') → formPermissions 包含 'edit' → true", () => {
    const userRoles = ref(["editor"]);
    const { can } = useFormAccess({ userRoles, formPermissions: ["view", "edit"] });
    expect(can("view")).toBe(true);
    expect(can("edit")).toBe(true);
    expect(can("manage")).toBe(false);
  });

  // ── 聚合 computed ──────────────────────────────

  it("visibleFields → 只返回用户可查看的字段名列表", () => {
    const userRoles = ref(["admin"]);
    const { visibleFields } = useFormAccess({
      userRoles,
      fieldRules: [
        { field: "a", viewRoles: ["admin"], editRoles: [] },
        { field: "b", viewRoles: ["admin"], editRoles: [] },
        { field: "c", viewRoles: ["superadmin"], editRoles: [] },
      ]
    });
    expect(visibleFields.value).toEqual(["a", "b"]);
  });
});