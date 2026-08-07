---
title: 'TopicDetailPage: form validation errors for meta fields even when values are
  populated'
aliases:
- bug_topicdetail_meta_validation_20260801
- topicdetail-meta-validation-bug
key: bug_topicdetail_meta_validation_20260801
tags:
- form-validation
- brd
- meta-fields
- element-plus
- bug
category: engineer/lessons
created: 2026-08-01
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
severity: major
priority: p1
project: YiVad
module: TopicDetailPage/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-08-01)
frequency: always
roles:
- engineer
- tech-lead
- oncall-sre
benefit: failure does not repeat
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./bug-metaschemas-sed-deletion.md
- ../incident-postmortem.md
tacit: false
---

# TopicDetailPage: form validation errors for meta fields even when values are populated

> **As an** engineer, **I want to** bug topicdetail meta validation, **so that** failure does not repeat.

> Element Plus form validation path is disconnected from the data model — `form.meta` does not exist, so required-field validation always fails.

## Summary

- In TopicDetailPage view mode, meta fields already have values but still report `meta.document_id is required`.
- Root cause: form model `form` has no `meta` attribute; meta values live in a separate `formMeta` reactive, but `el-form-item :prop` points to `meta.${key}`.
- Element Plus resolves `prop` path against `:model="form"`, so `form.meta.document_id` is always undefined and the required rule fires.
- Fix: merge `formMeta` into `form.meta`, unifying to a single data source.

## Core viewpoints

- **Framework validation paths are a contract between the template and the data model, and breaking that contract produces silent false positives**: Element Plus resolves `:prop="meta.x"` by walking the object tree on `:model="form"`. When `form.meta` does not exist, every required field reports an error regardless of actual values stored elsewhere. The validation system is not "wrong" -- it is faithfully reporting that the path it was told to check points to `undefined`.

- **Multiple reactive objects that each own a slice of the same conceptual entity are a design smell**: `form` owning title/content/tags and `formMeta` owning meta fields is a split-brain pattern. The form component cannot distinguish between these two sources, and the validation framework certainly cannot. A single source of truth for form state is not a best practice -- it is a hard requirement for any framework that introspects the model.

- **View mode and edit mode have fundamentally different validation semantics, and treating them identically guarantees false errors**: In view mode, all fields are pre-populated from the database; validation should be disabled or at minimum should compare against actual stored values. Running the same required-field rules in view mode as in create mode is a category error -- the user is not providing input, they are consuming output.

- **The `required: true` prop on a form item is not a declaration of business importance -- it is an instruction to the validation engine to auto-generate a rule**: When combined with a broken `:prop` path, this auto-generated rule becomes a guaranteed failure. The fix is not to remove `required: true` but to ensure the path resolves to the actual data, making the rule evaluate correctly.

- **String interpolation in template props hides path resolution bugs until runtime**: `` :prop="`meta.${field.key}`" `` looks correct in a code review because the interpolation resolves to a plausible string. The bug is invisible until the framework attempts to resolve that string against the model. Template literals in validation paths should be tested with a unit test that mounts the component with real data and asserts zero validation errors.


- **Element Plus validation depends on the form model path** — `:prop="meta.x"` must correspond to `form.meta.x` on `:model="form"`, otherwise it is always undefined.
- **Data model and validation path must share the same source** — splitting `formMeta` and `form.meta` breaks validation; this is a common Vue reactive pitfall.
- **Impact scope spans all topics** — BRD documentation, goal, stakeholders, rules, acceptance, milestones, approvals + all code-review topics.

## Key information

### Steps to Reproduce

1. Open http://localhost:8848/#/brd/brd-documents/detail/brd_brd-documents_claude002?mode=view
2. The form shows validation errors even though values already exist
3. Any meta field with `required: true` triggers

### Expected vs Actual

- **Expected**: in view mode the form displays stored values with no validation errors; required only fails when a field is actually empty.
- **Actual**: Element Plus reports `meta.document_id is required` and errors for all required meta fields, even though values have already been loaded from the database.

### Root Cause

In TopicDetailPage/index.vue the form model and value storage are disconnected:

```ts
const form = reactive({
  title: "",
  content: props.templateContent ?? "",
  tags: [] as string[]
});

const formMeta = reactive<Record<string, any>>({});
```

But `el-form-item :prop` points to `meta.${field.key}`:

```html
<el-form-item :label="field.label" :prop="`meta.${field.key}`" :required="field.required">
  <el-input v-model="formMeta[field.key]" />
</el-form-item>
```

Element Plus resolves `prop` against `:model="form"` — it validates `form.meta.document_id`, which is always undefined (because `form.meta` does not exist). Since `:required="true"`, Element Plus auto-generates a required rule. The value of `formMeta.document_id` is never inspected.

**Impact scope**: all meta fields with `required: true` across topics — BRD documentation, goal, stakeholders, rules, acceptance, milestones, approvals + all code-review topics.

### Solution

Merge `formMeta` into `form.meta`:

1. Add `meta: {} as Record<string, any>` to the `form` reactive
2. Change all `v-model="formMeta[field.key]"` in the template to `v-model="form.meta[field.key]"` (5 places)
3. Change `loadEntry()` to assign to `form.meta` instead of `formMeta`
4. Change `handleSave()` to spread `form.meta` instead of `formMeta`
5. Delete the orphaned `formMeta` reactive declaration

Ensure `form.meta` is the single data source — database load values, input bindings, and validation paths all point to `form.meta`.

## Action recommendations

1. In Element Plus forms the `:prop` path must match the object path on `:model`; splitting them breaks validation.
2. When multiple reactives coexist, clearly distinguish the "primary model" from "derived state" boundary to avoid dual sources.
3. Add unit tests for complex forms: in view mode load existing data and assert no validation errors.
4. Run e2e in CI: visit detail?mode=view path, screenshot-compare whether required errors appear.
5. Code review must check `:prop` and `:model` path consistency.



- **Multiple reactives each managing their own slice** — `form` manages title/content/tags, `formMeta` manages meta, the validation path cannot align.
- **Hard-coded string concatenation for `:prop`** — `meta.${field.key}` looks correct but the path's starting point is wrong; Element Plus resolves it against `model`.
- **`:required` auto-generating rules** — `required: true` makes Element Plus auto-add a required rule, which combined with undefined always fires.
- **Running validation in view mode** — view mode should disable validation or pre-fill values, otherwise errors are guaranteed.

## Anti-patterns

- **Using `reactive({})` with an empty object and dynamically adding keys later.** Vue's `reactive` tracks properties that exist at creation time. Keys added after creation via `formMeta[field.key] = value` are not guaranteed to be reactive in all Vue versions. The form may display the value but validation may not re-run when the value changes, leading to a false negative in validation. Always initialize reactive objects with all known keys, or use `ref<Record<string, any>>({})` for dynamic key sets.
- **Relying on the browser's form validation as the only validation layer.** Element Plus client-side validation can be bypassed by disabling JavaScript, by directly manipulating the DOM, or by sending a crafted API request. The backend must independently validate required fields, not trust that the frontend's `required: true` rule was enforced. The frontend validation is a UX convenience, not a security boundary.
- **Writing `:prop` as a template literal with a variable key without a unit test that asserts the resolved path.** `` :prop="`meta.${field.key}`" `` compiles to a string that looks correct in a code review, but the runtime path resolution is invisible until the form is mounted. A unit test that mounts the form with a known `field.key` value and asserts `form.meta[field.key]` is defined catches the path mismatch before it reaches QA.
- **Using the same form component for create and view modes without disabling validation in view mode.** In view mode, the user is not providing input, so validation errors are false positives that confuse the user. The form should either disable validation entirely in view mode (via `disabled` prop on `el-form`) or pre-populate all fields from the database before the form mounts, so that validation evaluates against actual data.
- **Splitting form state across multiple reactive objects because each section of the form was built by a different developer at a different time.** `form` owning title/content/tags and `formMeta` owning meta fields is an artifact of incremental development, not a design choice. When a new developer adds a third section, they will create `formExtra` and the pattern recurs. Refactor to a single `form` reactive with nested keys before adding the third section, and enforce the single-source-of-truth rule in code review.

## Related

- Same class: [./bug-metaschemas-sed-deletion.md](bug-bug-metaschemas-sed-deletion.md) — same-period meta-schemas bug
- Upstream: [../incident-postmortem.md](failure-incident-postmortem.md) — retrospective form (simplified version of this entry)
- Downstream: [../../gotchas/](.) — engineering pitfalls
