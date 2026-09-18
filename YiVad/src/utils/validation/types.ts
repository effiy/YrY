export interface ValidationRule {
  name: string;
  validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>;
  message: string;
  trigger: "change" | "blur" | "submit";
}

export interface FieldValidationConfig {
  field: string;
  label: string;
  rules: ValidationRule[];
  when?: (formData: Record<string, any>) => boolean;
}

export interface FieldState {
  status: "idle" | "validating" | "valid" | "invalid";
  errors: string[];
  dirty: boolean;
  touched: boolean;
}

/** Alias for FieldState — used by FormValidationMessage */
export type FieldValidationState = FieldState;

export interface ValidationState {
  fields: Record<string, FieldState>;
  formStatus: "idle" | "validating" | "valid" | "invalid";
  isValidating: boolean;
  submitCount: number;
}

/** Async validation rule with debounce support */
export interface AsyncValidationRule {
  name: string;
  validator: (value: any, formData: Record<string, any>) => Promise<boolean>;
  message: string;
  trigger: "change" | "blur" | "submit";
  debounceMs?: number;
}
