import type { AsyncValidationRule } from "./types";

/**
 * 异步验证器注册表
 */
const asyncValidators = new Map<string, AsyncValidationRule>();

export function registerAsyncValidator(name: string, rule: AsyncValidationRule): void {
  asyncValidators.set(name, rule);
}

export function getAsyncValidator(name: string): AsyncValidationRule | undefined {
  return asyncValidators.get(name);
}

export function unregisterAsyncValidator(name: string): void {
  asyncValidators.delete(name);
}

/**
 * 创建一个带防抖的异步验证器
 */
export function createDebouncedValidator(
  fn: (value: any) => Promise<boolean>,
  delay: number = 500
): (value: any) => Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (value: any): Promise<boolean> => {
    return new Promise((resolve) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const result = await fn(value);
          resolve(result);
        } catch {
          resolve(false);
        }
      }, delay);
    });
  };
}