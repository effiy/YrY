---
name: yry-optimize-meta-columns
description: >
  Optimizes MetaColumn width/minWidth values based on label string
  length so column headers display in a single line. Invoke when
  metaColumns have hardcoded widths that cause label wrapping or
  when adding new metaColumns.
lifecycle: default-pipeline
user_invocable: true
---

# Optimize MetaColumns Width

This skill optimizes the `width` and `minWidth` properties of `MetaColumn[]` arrays based on the character length of each column's `label`.

## Calculation Formula

```
basePx = label.length * 9 + 32
```

- Each ASCII character is estimated at **9px** (suitable for ~14px monospace/normal fonts).
- **32px** padding accounts for the sort icon (~16px) + cell padding on both sides.
- Results are rounded to the nearest **10px**.
- For columns with `enum` (select/tag), add an extra **20px** to accommodate the dropdown indicator or tag badge.

```
width = Math.round((label.length * 9 + 32 + (hasEnum ? 20 : 0)) / 10) * 10
```

If a column should flex to fill remaining space, use `minWidth` instead of `width`.

## When to Use

- When `metaColumns` have hardcoded `width` values that cause column header text to wrap or clip.
- When adding new `metaColumns` entries and needing correct width values.
- When labels are renamed or changed — recalculate widths accordingly.

## Usage

1. Identify all `metaColumns` arrays in the target file.
2. For each column, extract the `label` string and check if it has `enum`.
3. Apply the formula to compute `width` (or `minWidth` for flexible columns).
4. Replace the hardcoded values in the source file.

## Example

Before:
```ts
metaColumns: [
  { key: "brd_ref", label: "BRD Ref", width: 130 },
  { key: "title", label: "Document Title", minWidth: 180 },
  { key: "priority", label: "Priority", width: 90, enum: PRIORITY_OPTIONS },
]
```

After:
```ts
metaColumns: [
  { key: "brd_ref", label: "BRD Ref", width: 100, },          // 7*9+32=95 → 100
  { key: "title", label: "Document Title", minWidth: 160, },   // 14*9+32=158 → 160
  { key: "priority", label: "Priority", width: 120, enum: PRIORITY_OPTIONS },  // 8*9+32+20=124 → 120
]
```
