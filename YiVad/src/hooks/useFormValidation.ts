import { ref, reactive, computed } from "vue";
import type { ValidationRule, ValidationState, FieldValidationConfig } from "@/utils/validation/types";
import { builtinRules } from "@/utils/validation/rules";

interface UseFormValidationOptions {
  initialData: Record<string, any>;
  fields: FieldValidationConfig[];
  customRules?: Record<string, ValidationRule>;
}

const defaultState = (): ValidationState => ({
  fields: {},
  formStatus: "idle",
  isValidating: false,
  submitCount: 0,
});

export const useFormValidation = (options: UseFormValidationOptions) => {
  const { initialData, fields, customRules = {} } = options;

  const formData = reactive({ ...initialData });
  const state = reactive<ValidationState>(defaultState());
  const allRules = { ...builtinRules, ...customRules };

  // Initialize field states
  for (const field of fields) {
    state.fields[field.field] = {
      status: "idle",
      errors: [],
      dirty: false,
      touched: false,
    };
  }

  /** Get effective rules for a field, resolving named rule references */
  function getFieldRules(fieldName: string): ValidationRule[] {
    const config = fields.find((f) => f.field === fieldName);
    if (!config) return [];

    // Check when condition
    if (config.when && !config.when({ ...formData })) return [];

    return config.rules.map((rule) => {
      if (rule.name === "custom" && typeof rule.validator === "string") {
        const resolved = allRules[rule.validator as string];
        return resolved || rule;
      }
      return rule;
    });
  }

  /** Validate a single field */
  async function validateField(fieldName: string): Promise<boolean> {
    const fieldState = state.fields[fieldName];
    if (!fieldState) return true;

    const rules = getFieldRules(fieldName);
    if (rules.length === 0) {
      fieldState.status = "valid";
      fieldState.errors = [];
      return true;
    }

    fieldState.status = "validating";
    state.isValidating = true;
    const errors: string[] = [];
    const value = formData[fieldName];

    for (const rule of rules) {
      try {
        const result = rule.validator(value, { ...formData });
        const valid = result instanceof Promise ? await result : result;
        if (!valid) {
          errors.push(rule.message);
        }
      } catch {
        errors.push(rule.message);
      }
    }

    fieldState.errors = errors;
    fieldState.status = errors.length === 0 ? "valid" : "invalid";
    state.isValidating = false;
    return errors.length === 0;
  }

  /** Validate all fields */
  async function validateAll(): Promise<boolean> {
    state.formStatus = "validating";
    state.submitCount++;

    const results = await Promise.all(fields.map((f) => validateField(f.field)));
    const allValid = results.every(Boolean);

    state.formStatus = allValid ? "valid" : "invalid";
    return allValid;
  }

  /** Validate only touched/dirty fields */
  async function validateTouched(): Promise<boolean> {
    const touchedFields = fields.filter((f) => {
      const fs = state.fields[f.field];
      return fs && (fs.touched || fs.dirty);
    });
    const results = await Promise.all(touchedFields.map((f) => validateField(f.field)));
    return results.every(Boolean);
  }

  /** Mark field as touched (on blur) */
  function touchField(fieldName: string) {
    const fs = state.fields[fieldName];
    if (fs) {
      fs.touched = true;
      fs.dirty = true;
    }
    // Trigger validation for blur-triggered rules
    const rules = getFieldRules(fieldName);
    if (rules.some((r) => r.trigger === "blur")) {
      validateField(fieldName);
    }
  }

  /** Mark field as dirty (on change) */
  function markDirty(fieldName: string) {
    const fs = state.fields[fieldName];
    if (fs) {
      fs.dirty = true;
    }
    // Trigger validation for change-triggered rules
    const rules = getFieldRules(fieldName);
    if (rules.some((r) => r.trigger === "change")) {
      validateField(fieldName);
    }
  }

  /** Reset validation state */
  function resetValidation() {
    Object.assign(state, defaultState());
    for (const field of fields) {
      state.fields[field.field] = {
        status: "idle",
        errors: [],
        dirty: false,
        touched: false,
      };
    }
  }

  /** Clear errors for a specific field */
  function clearFieldError(fieldName: string) {
    const fs = state.fields[fieldName];
    if (fs) {
      fs.errors = [];
      fs.status = "idle";
    }
  }

  /** Get first error message for scroll-to-error */
  const firstErrorField = computed(() => {
    for (const field of fields) {
      const fs = state.fields[field.field];
      if (fs && fs.status === "invalid") return field.field;
    }
    return null;
  });

  /** Whether the form has any errors */
  const hasErrors = computed(() => state.formStatus === "invalid");

  /** Whether all fields are valid */
  const isValid = computed(() => state.formStatus === "valid");

  return {
    formData,
    state,
    firstErrorField,
    hasErrors,
    isValid,
    validateField,
    validateAll,
    validateTouched,
    touchField,
    markDirty,
    resetValidation,
    clearFieldError,
  };
};