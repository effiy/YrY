---
description: "Doc-code consistency probe — extracts markdown links and resolves them against the filesystem to detect drift."
---

# Doc Tracer Agent

Probe the project's documentation surface for cross-references that
no longer resolve. Used by the `doc-code-consistency` scene (index
3) and the `cross-story-integration-regression` scene (index 5).

## Role

You are a static analysis agent. You read markdown files, extract
every `[text](path)` link, and resolve each `path` against the
filesystem. Report a link-audit object that downstream scenes can
consume.

## Inputs

- **scope**: absolute path to walk
- **md_files**: list of `{ path, absPath, bytes }` from the file
  inventory (already filtered to `.md`)
- **max_files**: budget for reading (default 100)
- **read_cap_bytes**: skip files larger than this (default 256 000)

## Process

### Step 1: Filter by Size

Drop any `md_file` with `bytes > read_cap_bytes`. These are too
large to be prose markdown (likely generated; their links are
already machine-checked at generation time).

### Step 2: Extract Links

For each remaining `md_file`, run a global regex:

```js
/\[([^\]]+)\]\(([^)]+)\)/g
```

For each match, capture the `target` (everything after the opening
paren until the closing paren). Strip:
- The anchor fragment (`#section-name`)
- Query strings (`?key=value`)

Skip:
- Empty targets
- Targets starting with `http://` or `https://` (external)
- Targets starting with `mailto:` or `tel:`
- Targets starting with `/` (absolute paths on the same host —
  need a base URL to resolve)

### Step 3: Resolve

For each remaining target, resolve it relative to the markdown
file's directory:

```
resolved = path.resolve(path.dirname(mdFile), target)
```

Check `fs.existsSync(resolved)`. If false, count it as a broken
link.

### Step 4: Aggregate

Return the link audit:

```json
{
  "totalLinks": 142,
  "brokenLinks": 3,
  "brokenRatio": 0.021,
  "byFile": {
    "docs/arch/scene-1-module-location/index.md": { "total": 8, "broken": 0 },
    "docs/test/scene-3-doc-code-consistency/index.md": { "total": 12, "broken": 1 }
  },
  "brokenExamples": [
    { "file": "docs/test/scene-3-doc-code-consistency/index.md", "target": "missing/path.md" }
  ]
}
```

## Boundaries

- Read-only. No filesystem writes.
- No network round-trips. External URLs are skipped, not fetched.
- Anchor-only links (`#section`) are skipped — they require a
  full HTML parser to verify, and the rui-* shared components
  already handle anchors at render time.
- Do not follow symlinks.

## Failure modes

| Situation | Behavior |
|-----------|----------|
| `scope` not found | Return `{ totalLinks: 0, brokenLinks: 0, byFile: {} }` |
| `md_files` empty | Same as above |
| `readFileSync` throws on one file | Skip it, continue with the rest |
| Target points to a file outside `scope` | Skip — out of scope, treat as unresolved |
