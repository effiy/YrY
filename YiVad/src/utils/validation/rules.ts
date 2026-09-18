import type { ValidationRule } from "./types";
export function minLength(v: any, fd: Record<string, any>) {
  return String(v ?? "").length >= (fd._minLength ?? 0);
}
export function maxLength(v: any, fd: Record<string, any>) {
  return String(v ?? "").length <= (fd._maxLength ?? Infinity);
}
export function min(v: any, fd: Record<string, any>) {
  return Number(v) >= (fd._min ?? -Infinity);
}
export function max(v: any, fd: Record<string, any>) {
  return Number(v) <= (fd._max ?? Infinity);
}
export function pattern(v: any, fd: Record<string, any>) {
  return (fd._pattern as RegExp)?.test(String(v ?? "")) ?? true;
}
export function custom(_v: any, _fd: Record<string, any>) {
  return true;
}

/**
 * Parse a DSL string like "required|minLength:3|maxLength:100" into ValidationRule[].
 * Parameterized rules capture their parameter in a closure, making them self-contained
 * (no special formData keys needed).
 */
export function parseRuleString(dsl: string): ValidationRule[] {
  if (!dsl || !dsl.trim()) return [];

  return dsl
    .split("|")
    .map(segment => {
      const [name, param] = segment.split(":");
      const trimmed = name.trim();

      switch (trimmed) {
        case "required":
          return { ...builtinRules.required };
        case "email":
          return { ...builtinRules.email };
        case "url":
          return { ...builtinRules.url };
        case "numeric":
          return { ...builtinRules.numeric };
        case "integer":
          return { ...builtinRules.integer };
        case "dateFormat":
          return { ...builtinRules.dateFormat };
        case "minLength": {
          const len = Number(param);
          return {
            name: "minLength",
            validator: (v: any) => String(v ?? "").length >= len,
            message: `最少${len}个字符`,
            trigger: "blur" as const
          };
        }
        case "maxLength": {
          const len = Number(param);
          return {
            name: "maxLength",
            validator: (v: any) => String(v ?? "").length <= len,
            message: `最多${len}个字符`,
            trigger: "blur" as const
          };
        }
        case "min": {
          const min = Number(param);
          return {
            name: "min",
            validator: (v: any) => Number(v) >= min,
            message: `不能小于${min}`,
            trigger: "blur" as const
          };
        }
        case "max": {
          const max = Number(param);
          return {
            name: "max",
            validator: (v: any) => Number(v) <= max,
            message: `不能大于${max}`,
            trigger: "blur" as const
          };
        }
        case "pattern": {
          const regex = new RegExp(param);
          return {
            name: "pattern",
            validator: (v: any) => regex.test(String(v ?? "")),
            message: "格式不正确",
            trigger: "blur" as const
          };
        }
        default:
          return null;
      }
    })
    .filter((r): r is ValidationRule => r !== null);
}

export const builtinRules: Record<string, ValidationRule> = {
  required: {
    name: "required",
    validator: (v: any) => v !== null && v !== undefined && v !== "",
    message: "此字段为必填",
    trigger: "blur"
  },
  email: {
    name: "email",
    validator: (v: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "")),
    message: "请输入有效的邮箱地址",
    trigger: "blur"
  },
  url: {
    name: "url",
    validator: (v: any) => {
      try {
        new URL(String(v ?? ""));
        return true;
      } catch {
        return false;
      }
    },
    message: "请输入有效的URL",
    trigger: "blur"
  },
  numeric: {
    name: "numeric",
    validator: (v: any) => !isNaN(Number(v)),
    message: "请输入数字",
    trigger: "blur"
  },
  integer: {
    name: "integer",
    validator: (v: any) => Number.isInteger(Number(v)),
    message: "请输入整数",
    trigger: "blur"
  },
  minLength: {
    name: "minLength",
    validator: (v: any, fd: Record<string, any>) => String(v ?? "").length >= (fd._minLength ?? 0),
    message: "输入长度不足",
    trigger: "blur"
  },
  maxLength: {
    name: "maxLength",
    validator: (v: any, fd: Record<string, any>) => String(v ?? "").length <= (fd._maxLength ?? Infinity),
    message: "输入长度超出限制",
    trigger: "blur"
  },
  min: {
    name: "min",
    validator: (v: any, fd: Record<string, any>) => Number(v) >= (fd._min ?? -Infinity),
    message: "数值小于最小值",
    trigger: "blur"
  },
  max: {
    name: "max",
    validator: (v: any, fd: Record<string, any>) => Number(v) <= (fd._max ?? Infinity),
    message: "数值超出最大值",
    trigger: "blur"
  },
  pattern: {
    name: "pattern",
    validator: (v: any, fd: Record<string, any>) => (fd._pattern as RegExp)?.test(String(v ?? "")) ?? true,
    message: "格式不正确",
    trigger: "blur"
  },
  dateFormat: {
    name: "dateFormat",
    validator: (v: any) => !isNaN(Date.parse(String(v ?? ""))),
    message: "请输入有效的日期",
    trigger: "blur"
  }
};
