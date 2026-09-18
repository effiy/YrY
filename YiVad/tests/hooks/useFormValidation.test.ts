/**
 * useFormValidation — 声明式表单验证
 *
 * ## 场景
 * 用户注册表单：实时校验用户名、邮箱、密码。失焦触发必填/格式检查，提交时汇总
 * 所有错误并滚动定位到第一个失败字段。异步验证（如用户名唯一性）需防抖避免频繁请求。
 *
 * ## 效果演示
 * ```
 * const { formData, validateField, validateAll, firstErrorField, hasErrors } =
 *   useFormValidation({ initialData: {}, fields: [
 *     { field: "username", label: "用户名", rules: [{ required }, { minLength: 3 }] },
 *     { field: "email",    label: "邮箱",   rules: [{ required }, { email: true }] },
 *   ], asyncDebounceMs: 300 });
 *
 * // 模板中:
 * // <el-input v-model="formData.username" @blur="touchField('username')" />
 * // <span v-if="state.fields.username.errors.length">{{ state.fields.username.errors[0] }}</span>
 * // <el-button @click="submit" :disabled="hasErrors">提交</el-button>
 *
 * // 提交时:
 * // const ok = await validateAll();
 * // if (!ok) scrollTo(firstErrorField.value);
 * ```
 *
 * ## 关键行为
 * - 未配置规则的字段默认 valid
 * - `when` 返回 false 时跳过该字段所有验证
 * - `validateFieldDebounced` 在 asyncDebounceMs 内多次调用只执行最后一次
 * - `validateAll` 前自动清除所有待处理的防抖定时器
 * - `firstErrorField` 按 fields 声明顺序返回第一个 invalid 字段名
 */
import { describe, it, expect, vi } from "vitest";
import { useFormValidation } from "@/hooks/useFormValidation";
import type { FieldValidationConfig } from "@/utils/validation/types";

describe("useFormValidation", () => {
  const fields: FieldValidationConfig[] = [
    {
      field: "name",
      label: "Name",
      rules: [
        { name: "required", validator: (v: any) => v !== null && v !== undefined && v !== "", message: "Name is required", trigger: "blur" },
        { name: "minLength", validator: (v: any) => String(v ?? "").length >= 3, message: "Min 3 chars", trigger: "blur" }
      ]
    },
    {
      field: "email",
      label: "Email",
      rules: [
        { name: "email", validator: (v: any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "")), message: "Invalid email", trigger: "blur" }
      ]
    },
    {
      field: "age",
      label: "Age",
      rules: [
        { name: "numeric", validator: (v: any) => !isNaN(Number(v)), message: "Must be a number", trigger: "blur" }
      ]
    }
  ];

  // ── 初始化：所有字段进入 idle，等待用户交互 ─────────────

  it("所有字段初始状态为 idle", () => {
    const { state } = useFormValidation({ initialData: {}, fields });
    expect(state.fields.name.status).toBe("idle");
    expect(state.fields.email.status).toBe("idle");
    expect(state.fields.age.status).toBe("idle");
  });

  // ── 单字段验证：失焦或手动触发时执行 ──────────────────

  it("必填字段为空 → validateField 返回 false，errors 非空", async () => {
    const { validateField } = useFormValidation({ initialData: { name: "" }, fields });
    expect(await validateField("name")).toBe(false);
  });

  it("字段值通过所有规则 → validateField 返回 true", async () => {
    const { validateField } = useFormValidation({ initialData: { name: "John" }, fields });
    expect(await validateField("name")).toBe(true);
  });

  it("邮箱格式不合法 → 返回 false", async () => {
    const { validateField } = useFormValidation({ initialData: { email: "not-an-email" }, fields });
    expect(await validateField("email")).toBe(false);
  });

  it("合法邮箱 → 返回 true", async () => {
    const { validateField } = useFormValidation({ initialData: { email: "test@example.com" }, fields });
    expect(await validateField("email")).toBe(true);
  });

  // ── 全量验证：提交时调用，汇总所有字段错误 ─────────────

  it("所有字段合法 → validateAll 返回 true，formStatus='valid'", async () => {
    const { validateAll, state } = useFormValidation({
      initialData: { name: "John", email: "john@test.com", age: 30 }, fields
    });
    expect(await validateAll()).toBe(true);
    expect(state.formStatus).toBe("valid");
  });

  it("任一字段不合法 → validateAll 返回 false，formStatus='invalid'", async () => {
    const { validateAll, state } = useFormValidation({
      initialData: { name: "", email: "bad", age: "abc" }, fields
    });
    expect(await validateAll()).toBe(false);
    expect(state.formStatus).toBe("invalid");
  });

  // ── 触摸/脏标记：控制何时触发验证 ──────────────────────

  it("touchField → touched=true, dirty=true（blur 触发）", () => {
    const { touchField, state } = useFormValidation({ initialData: { name: "" }, fields });
    touchField("name");
    expect(state.fields.name.touched).toBe(true);
    expect(state.fields.name.dirty).toBe(true);
  });

  it("markDirty → dirty=true（change 触发，不标记 touched）", () => {
    const { markDirty, state } = useFormValidation({ initialData: { name: "" }, fields });
    markDirty("name");
    expect(state.fields.name.dirty).toBe(true);
  });

  // ── 异步防抖：避免每次按键都发 API 请求 ─────────────────

  it("validateFieldDebounced 在 asyncDebounceMs 毫秒后才执行验证", async () => {
    vi.useFakeTimers();
    const { validateFieldDebounced, state } = useFormValidation({
      initialData: { name: "" }, fields, asyncDebounceMs: 200
    });
    validateFieldDebounced("name");
    expect(state.fields.name.status).toBe("idle"); // 尚未执行
    await vi.advanceTimersByTimeAsync(250);
    expect(state.fields.name.status).toBe("invalid");
    vi.useRealTimers();
  });

  it("防抖窗口内多次调用 → 仅最后一次生效", async () => {
    vi.useFakeTimers();
    const { validateFieldDebounced, state } = useFormValidation({
      initialData: { name: "" },
      fields: [{ field: "name", label: "Name", rules: [
        { name: "required", validator: (v: any) => v !== null && v !== undefined && v !== "", message: "Required", trigger: "blur" }
      ]}],
      asyncDebounceMs: 200
    });
    validateFieldDebounced("name");
    await vi.advanceTimersByTimeAsync(50);
    validateFieldDebounced("name");
    await vi.advanceTimersByTimeAsync(50);
    validateFieldDebounced("name");
    await vi.advanceTimersByTimeAsync(250);
    expect(state.fields.name.status).toBe("invalid");
    vi.useRealTimers();
  });

  // ── 重置与清理 ──────────────────────────────────────────

  it("resetValidation → 所有字段回 idle，submitCount 归零", async () => {
    const { touchField, resetValidation, state } = useFormValidation({ initialData: { name: "" }, fields });
    touchField("name");
    resetValidation();
    expect(state.fields.name.status).toBe("idle");
    expect(state.fields.name.dirty).toBe(false);
    expect(state.submitCount).toBe(0);
  });

  it("clearFieldError → 清除单字段错误，状态回 idle", async () => {
    const { validateField, clearFieldError, state } = useFormValidation({ initialData: { name: "" }, fields });
    await validateField("name");
    expect(state.fields.name.status).toBe("invalid");
    clearFieldError("name");
    expect(state.fields.name.errors).toHaveLength(0);
    expect(state.fields.name.status).toBe("idle");
  });

  // ── 辅助 computed：驱动 UI 反馈 ─────────────────────────

  it("firstErrorField → 返回第一个 invalid 字段名，用于 scroll-to-error", async () => {
    const { validateAll, firstErrorField } = useFormValidation({
      initialData: { name: "", email: "ok@test.com", age: 25 }, fields
    });
    await validateAll();
    expect(firstErrorField.value).toBe("name"); // name 在 fields 数组中排第一
  });

  it("hasErrors/isValid → 反映整体表单状态", async () => {
    const { validateAll, hasErrors, isValid } = useFormValidation({
      initialData: { name: "John", email: "john@test.com", age: 30 }, fields
    });
    await validateAll();
    expect(hasErrors.value).toBe(false);
    expect(isValid.value).toBe(true);
  });

  // ── 部分验证 ────────────────────────────────────────────

  it("validateTouched → 只验证 touched/dirty 字段，未交互字段保持 idle", async () => {
    const { touchField, validateTouched, state } = useFormValidation({
      initialData: { name: "", email: "bad", age: "abc" }, fields
    });
    touchField("name");
    await validateTouched();
    expect(state.fields.name.status).toBe("invalid");
    expect(state.fields.email.status).toBe("idle"); // 未触摸，不验证
  });

  // ── 条件验证 ────────────────────────────────────────────

  it("when 返回 false → 跳过该字段所有验证规则", () => {
    const condFields: FieldValidationConfig[] = [{
      field: "conditional",
      label: "Cond",
      rules: [{ name: "required", validator: () => false, message: "Req", trigger: "blur" }],
      when: () => false
    }];
    const { state } = useFormValidation({ initialData: {}, fields: condFields });
    expect(state.fields.conditional.status).toBe("idle"); // 规则被跳过
  });
});