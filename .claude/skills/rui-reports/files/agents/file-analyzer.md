# file-analyzer.md

> Specialized agent for Stage 1 of rui-report-files. Walks the
> scope and emits a normalized `FileRecord[]` for downstream
> stages.

## Input

| Field | Type | Description |
|-------|------|-------------|
| `scope` | path | Absolute path of the directory to walk |
| `exclusions` | string[] | Optional override of the default exclusion set |

## Output

```ts
type FileRecord = {
  path: string;       // relative to scope root, POSIX separators
  absPath: string;    // absolute, realpath-resolved
  bytes: number;
  lines: number;
  type: 'js' | 'ts' | 'mjs' | 'cjs' | 'jsx' | 'tsx' | 'vue' |
        'py' | 'go' | 'java' | 'rust' | 'css' | 'scss' | 'other';
  lastModified: number;  // unix seconds, from stat mtime
};

type FileInventoryResult = {
  records: FileRecord[];
  totalFiles: number;
  totalBytes: number;
  skipped: { path: string; reason: string }[];
};
```

## Walk algorithm

1. `find <scope> -type f -not -path '<exclusion>' ...` — emit paths NUL-separated for safe piping.
2. Batch metadata extraction: `find -printf '%p\t%s\t%T@\n'` (GNU) or `find -print0 | xargs -0 stat -f '%z %m %N'` (macOS) / `stat -c '%s %Y %n'` (Linux). Per-file `stat` spawns are forbidden on repos with > 1 000 files (see `rules/analysis-contracts.md`).
3. Batch line counting: `find -print0 | xargs -0 wc -l`. Per-file `wc -l` spawns are forbidden on the same threshold.
4. Derive `type` from the extension; map to the normalized union.
5. Skip unreadable files; record them in `skipped` with `reason: 'permission'` or `reason: 'binary'`.
6. Normalize separators to POSIX. Sort `records` by `path asc` for determinism.

## Boundaries

- Does NOT extract imports (Stage 3's job)
- Does NOT compute depth, cycles, fan-in, fan-out, or hotspot score
- Does NOT write the HTML report
- Honors `exclusions` strictly; never traverses into excluded paths even if explicitly re-added by a sub-walk

## Failure modes

| Situation | Behavior |
|-----------|----------|
| `scope` does not exist | Return `{ records: [], totalFiles: 0, totalBytes: 0, skipped: [], error: 'scope-not-found' }` |
| No source files after exclusions | Return `{ records: [], ..., error: 'empty-scope' }` |
| Single file stat fails | Add to `skipped`, continue |
