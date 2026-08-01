---
title: 'TopicDetailPage: form validation errors for meta fields even when values are
  populated'
key: bug_topicdetail_meta_validation_20260801
tags:
- form-validation
- brd
- meta-fields
- element-plus
category: lessons/failures/bugs
created: '2026-08-01'
updated: '2026-08-01'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: TopicDetailPage/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-08-01)
frequency: always
---

## Description

In TopicDetailPage/index.vue, when viewing a BRD document detail page in view mode (`?mode=view`), the form shows validation errors for meta fields like "meta.document_id is required" even though the form data is populated with values.

## Steps to Reproduce
1. Open http://localhost:8848/#/brd/brd-documents/detail/brd_brd-documents_claude002?mode=view
2. Observe that form fields show validation errors even though values exist
3. The error occurs for any meta field with `required: true` in the schema

## Expected Result
In view mode, the form should display stored values without validation errors. Required field validation should only fail when the field is actually empty.

## Actual Result
Element Plus form validation shows "meta.document_id is required" and similar messages for all required meta fields, even when values are loaded from the database.

## Cause
**Root cause**: Data model disconnect between form validation and value storage in `TopicDetailPage/index.vue`.

The form model `form` (a reactive object) had no `meta` property:
```ts
const form = reactive({
  title: "",
  content: props.templateContent ?? "",
  tags: [] as string[]
});
```

Meta field values were stored in a separate `formMeta` reactive:
```ts
const formMeta = reactive<Record<string, any>>({});
```

But form-item `prop` attributes pointed to `meta.${field.key}` (e.g., `meta.document_id`):
```html
<el-form-item :label="field.label" :prop="`meta.${field.key}`" :required="field.required">
  <el-input v-model="formMeta[field.key]" />
</el-form-item>
```

Element Plus resolves the `prop` path against the form's `:model="form"` — so it validates `form.meta.document_id`, which is always `undefined` (because `form.meta` doesn't exist). Since `:required="true"`, Element Plus auto-generates a required validation rule. The value in `formMeta.document_id` is never checked.

**Impact scope**: All meta fields with `required: true` across ALL topics using `TopicDetailPage` (BRD documents, objectives, stakeholders, rules, acceptance criteria, milestones, approvals — plus all code-review topics).

## Solution
Consolidated `formMeta` into `form.meta`:

1. Added `meta: {} as Record<string, any>` to the `form` reactive
2. Changed all template `v-model="formMeta[field.key]"` → `v-model="form.meta[field.key]"` (5 occurrences)
3. Updated `loadEntry()` to assign `form.meta` instead of `formMeta`
4. Updated `handleSave()` to spread `form.meta` instead of `formMeta`
5. Removed the orphan `formMeta` reactive declaration

This ensures the form model `form.meta` is the single source of truth — values loaded from the database populate `form.meta`, inputs bind to `form.meta`, and validation checks `form.meta`.
