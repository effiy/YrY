---
description: "Graph algorithm reference — dependency graph construction, circular detection, and module ranking."
---

# Graph Algorithm Reference

## Dependency Graph Construction

```
Algorithm: BFS import parsing
Complexity: O(f × i) where f = resolvable files, i = avg imports/file

1. Start from entry points (index files, main exports)
2. For each file: parse imports, classify (relative/alias/external)
3. Resolve relative imports to absolute module paths
4. Add directed edges: importing_file → imported_module
5. Recurse into unresolved internal modules
```

## Circular Dependency Detection

```
Algorithm: Johnson-style DFS with recursion stack
Complexity: O(V + E)

1. DFS from each unvisited node
2. Track visited set + recursion stack
3. Back-edge detected (node in recStack) → extract cycle path
4. Sort cycles by length ascending
5. Emit top 20 cycles
```

## Module Ranking (PageRank-inspired)

```
Score(module) = (1 - d) + d × Σ(Score(incoming) / fan_out(incoming))
d = damping factor (0.85)

High score → core module (modify with care)
Low score → leaf module (safe to change)
```

## Instability vs Abstractness

```
I = fan_out / (fan_in + fan_out)    // 0 = stable, 1 = unstable
A = abstract_count / total_count    // 0 = concrete, 1 = abstract
D = |A + I - 1|                     // distance from main sequence

D < 0.3 → healthy
D > 0.7 → zone of pain/uselessness
```
