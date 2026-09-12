import { ref, computed, type Ref } from "vue";

type FormPermission = "view" | "edit" | "submit" | "approve" | "manage";

interface FieldAccessRule {
  field: string;
  viewRoles: string[];
  editRoles: string[];
}

interface UseFormAccessOptions {
  userRoles: Ref<string[]>;
  formPermissions?: FormPermission[];
  fieldRules?: FieldAccessRule[];
  isReadonly?: boolean;
}

export const useFormAccess = (options: UseFormAccessOptions) => {
  const { userRoles, formPermissions = [], fieldRules = [], isReadonly = false } = options;

  /** Whether the user has a specific form-level permission */
  function can(permission: FormPermission): boolean {
    if (isReadonly && permission !== "view") return false;
    return formPermissions.includes(permission);
  }

  /** Whether a field is visible to the current user */
  function canViewField(fieldName: string): boolean {
    const rule = fieldRules.find((r) => r.field === fieldName);
    if (!rule) return true;
    if (rule.viewRoles.length === 0) return true;
    return rule.viewRoles.some((role) => userRoles.value.includes(role));
  }

  /** Whether a field is editable by the current user */
  function canEditField(fieldName: string): boolean {
    if (isReadonly) return false;
    const rule = fieldRules.find((r) => r.field === fieldName);
    if (!rule) return true;
    if (rule.editRoles.length === 0) return true;
    return rule.editRoles.some((role) => userRoles.value.includes(role));
  }

  /** Get all visible fields */
  const visibleFields = computed(() => {
    return fieldRules.filter((r) => canViewField(r.field)).map((r) => r.field);
  });

  /** Get all editable fields */
  const editableFields = computed(() => {
    return fieldRules.filter((r) => canEditField(r.field)).map((r) => r.field);
  });

  return {
    can,
    canViewField,
    canEditField,
    visibleFields,
    editableFields,
  };
};