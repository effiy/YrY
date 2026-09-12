export interface ValidationRule {
  name: string;
  validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>;
  message: string;
  trigger: "change" | "blur" | "submit";
}

export interface FieldValidationState {
  status: "idle" | "validating" | "valid" | "invalid";
  errors: string[];
  dirty: boolean;
  touched: boolean;
}

export interface ValidationState {
  fields: Record<string, FieldValidationState>;
  formStatus: "idle" | "validating" | "valid" | "invalid";
  isValidating: boolean;
  submitCount: number;
}

export interface FieldValidationConfig {
  field: string;
  label: string;
  rules: ValidationRule[];
  when?: (formData: Record<string, any>) => boolean;
}

export interface AsyncValidationRule extends ValidationRule {
  async: true;
  debounce?: number;
}