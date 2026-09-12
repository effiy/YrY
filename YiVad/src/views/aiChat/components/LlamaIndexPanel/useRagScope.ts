import { ref, computed, type Ref } from "vue";

interface ScopeFileInfo {
  path: string;
  name: string;
  dir: string;
}

export function useRagScope(scopeFiles: Ref<string[]>) {
  const hasScope = computed(() => scopeFiles.value.length > 0);

  const derivedScope = computed(() => {
    if (!scopeFiles.value.length) return "";
    if (scopeFiles.value.length === 1) return scopeFiles.value[0];
    const parts = scopeFiles.value.map((p: string) => p.split("/"));
    const minLen = Math.min(...parts.map((p: string[]) => p.length));
    const c: string[] = [];
    for (let i = 0; i < minLen; i++) {
      if (parts.every((p: string[]) => p[i] === parts[0][i])) c.push(parts[0][i]);
      else break;
    }
    return c.join("/") || "";
  });

  const scopeFileInfos = computed<ScopeFileInfo[]>(() =>
    scopeFiles.value.map((p: string) => {
      const s = p.split("/");
      return { path: p, name: s.pop() || p, dir: s.join("/") || "root" };
    })
  );

  const scopeFileFilter = ref("");
  const filteredScopeFileInfos = computed(() => {
    const q = scopeFileFilter.value.trim().toLowerCase();
    if (!q) return scopeFileInfos.value;
    return scopeFileInfos.value.filter((f) => f.path.toLowerCase().includes(q));
  });

  const scopeFileGroups = computed(() => {
    const m = new Map<string, ScopeFileInfo[]>();
    for (const f of scopeFileInfos.value) {
      const l = m.get(f.dir) || [];
      l.push(f);
      m.set(f.dir, l);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  });

  return {
    hasScope,
    derivedScope,
    scopeFileInfos,
    scopeFileFilter,
    filteredScopeFileInfos,
    scopeFileGroups,
  };
}

export type { ScopeFileInfo };