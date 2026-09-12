import { ref, watch, type Ref } from "vue";

interface FieldDependency {
  /** The dependent field (child) */
  field: string;
  /** The field it depends on (parent) */
  dependsOn: string | string[];
  /** Options loader — called when parent value changes */
  loader?: (parentValues: Record<string, any>) => Promise<any[]>;
  /** Map parent values to child value (for computed fields) */
  compute?: (parentValues: Record<string, any>) => any;
  /** Whether to clear child value when parent changes */
  clearOnChange?: boolean;
}

interface UseFieldDependencyOptions {
  formData: Ref<Record<string, any>>;
  dependencies: FieldDependency[];
}

export const useFieldDependency = (options: UseFieldDependencyOptions) => {
  const { formData, dependencies } = options;

  /** Options for cascade selects, keyed by field name */
  const cascadeOptions = ref<Record<string, any[]>>({});
  /** Loading state for async options */
  const loadingOptions = ref<Record<string, boolean>>({});
  /** Visibility state for conditional fields */
  const fieldVisibility = ref<Record<string, boolean>>({});
  /** Whether field is readonly (computed) */
  const fieldReadonly = ref<Record<string, boolean>>({});

  // Track which parent fields each dependency watches
  const depMap = new Map<string, FieldDependency[]>();
  for (const dep of dependencies) {
    const parents = Array.isArray(dep.dependsOn) ? dep.dependsOn : [dep.dependsOn];
    for (const parent of parents) {
      const existing = depMap.get(parent) || [];
      existing.push(dep);
      depMap.set(parent, existing);
    }
  }

  /** Resolve dependencies for a changed field */
  async function resolveDeps(changedField: string) {
    const deps = depMap.get(changedField);
    if (!deps || deps.length === 0) return;

    for (const dep of deps) {
      const parents = Array.isArray(dep.dependsOn) ? dep.dependsOn : [dep.dependsOn];
      const parentValues: Record<string, any> = {};
      for (const p of parents) {
        parentValues[p] = formData.value[p];
      }

      // Handle computed fields
      if (dep.compute) {
        formData.value[dep.field] = dep.compute(parentValues);
        fieldReadonly.value[dep.field] = true;
      }

      // Handle cascade loader
      if (dep.loader) {
        loadingOptions.value[dep.field] = true;
        try {
          const options = await dep.loader(parentValues);
          cascadeOptions.value[dep.field] = options;
        } finally {
          loadingOptions.value[dep.field] = false;
        }
      }

      // Clear child value on parent change
      if (dep.clearOnChange !== false && !dep.compute) {
        formData.value[dep.field] = undefined;
      }
    }
  }

  /** Check for circular dependencies */
  function detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    function dfs(field: string, path: string[]) {
      visited.add(field);
      recStack.add(field);
      path.push(field);

      const deps = depMap.get(field);
      if (deps) {
        for (const dep of deps) {
          if (!visited.has(dep.field)) {
            dfs(dep.field, [...path]);
          } else if (recStack.has(dep.field)) {
            const cycleStart = path.indexOf(dep.field);
            cycles.push(path.slice(cycleStart));
          }
        }
      }

      recStack.delete(field);
    }

    for (const field of depMap.keys()) {
      if (!visited.has(field)) {
        dfs(field, []);
      }
    }

    return cycles;
  }

  // Initialize all fields as visible
  for (const dep of dependencies) {
    fieldVisibility.value[dep.field] = true;
  }

  return {
    cascadeOptions,
    loadingOptions,
    fieldVisibility,
    fieldReadonly,
    resolveDeps,
    detectCycles,
  };
};