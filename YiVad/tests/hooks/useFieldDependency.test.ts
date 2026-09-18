/**
 * useFieldDependency — 字段依赖与级联选择
 *
 * ## 场景
 * 省/市/区三级联动：选择省份后异步加载城市选项，切换省份自动清空已选城市。
 * 报价单：修改「单价」或「数量」→ 自动计算「总价」并设为只读。
 * 配置表单：所选「集群类型」决定了可用「节点规格」列表。
 *
 * ## 效果演示
 * ```
 * const { cascadeOptions, fieldReadonly, resolveDeps, detectCycles } =
 *   useFieldDependency({ formData, dependencies: [
 *     { field: "city", dependsOn: "province", loader: fetchCities, clearOnChange: true },
 *     { field: "total", dependsOn: ["price", "quantity"], compute: (d) => d.price * d.quantity },
 *   ] });
 *
 * // 模板中:
 * // <el-select v-model="formData.province" @change="resolveDeps('province')">
 * // <el-select v-model="formData.city">
 * //   <el-option v-for="o in cascadeOptions.city" :key="o.value" :label="o.label" :value="o.value" />
 * // </el-select>
 * // <el-input v-model="formData.total" :readonly="fieldReadonly.total" />
 * ```
 *
 * ## 关键行为
 * - `detectCycles()` 返回空数组 = 无循环依赖
 * - `loader` 异步返回子选项，`cascadeOptions` 响应式更新
 * - `clearOnChange: true` → 父字段变更时自动置空子字段
 * - `compute` 派生字段自动标记 `fieldReadonly=true`
 */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useFieldDependency } from "@/hooks/useFieldDependency";

describe("useFieldDependency", () => {
  // ── 循环检测：阻止无效依赖配置 ───────────────────────

  it("无环图 → detectCycles 返回空数组", () => {
    const formData = ref({ province: "", city: "" });
    const { detectCycles } = useFieldDependency({ formData, dependencies: [
      { field: "city", dependsOn: "province" }
    ]});
    expect(detectCycles()).toHaveLength(0);
  });

  it("A → B → A 循环 → detectCycles 返回非空数组", () => {
    const formData = ref({ a: 1, b: 2 });
    const { detectCycles } = useFieldDependency({ formData, dependencies: [
      { field: "a", dependsOn: "b" },
      { field: "b", dependsOn: "a" }
    ]});
    expect(detectCycles().length).toBeGreaterThan(0);
  });

  // ── 级联加载：父字段变更 → 异步加载子选项 ────────────

  it("resolveDeps('province') → loader 返回选项存入 cascadeOptions.city", async () => {
    const formData = ref({ province: "Zhejiang", city: undefined });
    const loader = async (pv: any) => pv.province === "Zhejiang"
      ? [{ label: "Hangzhou", value: "hz" }, { label: "Ningbo", value: "nb" }]
      : [];
    const { cascadeOptions, resolveDeps } = useFieldDependency({ formData, dependencies: [
      { field: "city", dependsOn: "province", loader }
    ]});
    await resolveDeps("province");
    expect(cascadeOptions.value.city).toHaveLength(2);
  });

  // ── 父子联动：切换省份 → 清空城市 ────────────────────

  it("clearOnChange=true → 父字段变更后子字段值为 undefined", async () => {
    const formData = ref({ province: "Zhejiang", city: "hz" });
    const { resolveDeps } = useFieldDependency({ formData, dependencies: [
      { field: "city", dependsOn: "province", clearOnChange: true }
    ]});
    formData.value.province = "Jiangsu";
    await resolveDeps("province");
    expect(formData.value.city).toBeUndefined();
  });

  // ── 字段计算：单价 × 数量 = 总价（只读） ──────────────

  it("compute → 派生字段值 + 标记 readonly", async () => {
    const formData = ref({ price: 10, quantity: 3, total: 0 });
    const { resolveDeps, fieldReadonly } = useFieldDependency({ formData, dependencies: [{
      field: "total", dependsOn: ["price", "quantity"],
      compute: (pv: any) => pv.price * pv.quantity
    }]});
    await resolveDeps("price");
    expect(formData.value.total).toBe(30);
    expect(fieldReadonly.value.total).toBe(true);
  });
});