import type { ValidationRule, ValidationState, FieldValidationState } from "./types";

export { type ValidationRule, type ValidationState, type FieldValidationState } from "./types";

/**
 * 内置验证规则库
 */
export const builtinRules: Record<string, ValidationRule> = {
  required: {
    name: "required",
    validator: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message: "此项为必填",
    trigger: "blur",
  },

  email: {
    name: "email",
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: "请输入有效的邮箱地址",
    trigger: "blur",
  },

  url: {
    name: "url",
    validator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: "请输入有效的 URL",
    trigger: "blur",
  },

  numeric: {
    name: "numeric",
    validator: (value: any) => !isNaN(Number(value)),
    message: "请输入数字",
    trigger: "blur",
  },

  integer: {
    name: "integer",
    validator: (value: any) => Number.isInteger(Number(value)),
    message: "请输入整数",
    trigger: "blur",
  },

  phone: {
    name: "phone",
    validator: (value: string) => /^1[3-9]\d{9}$/.test(value),
    message: "请输入有效的手机号码",
    trigger: "blur",
  },

  idCard: {
    name: "idCard",
    validator: (value: string) => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value),
    message: "请输入有效的身份证号",
    trigger: "blur",
  },
};

/**
 * 创建长度验证规则
 */
export function minLength(min: number, message?: string): ValidationRule {
  return {
    name: "minLength",
    validator: (value: string) => typeof value === "string" && value.length >= min,
    message: message || `至少 ${min} 个字符`,
    trigger: "blur",
  };
}

export function maxLength(max: number, message?: string): ValidationRule {
  return {
    name: "maxLength",
    validator: (value: string) => typeof value === "string" && value.length <= max,
    message: message || `不超过 ${max} 个字符`,
    trigger: "blur",
  };
}

/**
 * 创建数值范围验证规则
 */
export function min(min: number, message?: string): ValidationRule {
  return {
    name: "min",
    validator: (value: any) => Number(value) >= min,
    message: message || `不能小于 ${min}`,
    trigger: "blur",
  };
}

export function max(max: number, message?: string): ValidationRule {
  return {
    name: "max",
    validator: (value: any) => Number(value) <= max,
    message: message || `不能大于 ${max}`,
    trigger: "blur",
  };
}

/**
 * 创建正则验证规则
 */
export function pattern(regex: RegExp, message?: string): ValidationRule {
  return {
    name: "pattern",
    validator: (value: string) => regex.test(value),
    message: message || "格式不正确",
    trigger: "blur",
  };
}

/**
 * 创建自定义验证规则
 */
export function custom(validator: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>, message?: string): ValidationRule {
  return {
    name: "custom",
    validator,
    message: message || "验证失败",
    trigger: "blur",
  };
}