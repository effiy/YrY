---
title: 'TopicDetailPage: form validation errors for meta fields even when values are
  populated'
tags:
- form-validation
- brd
- meta-fields
- element-plus
category: engineer/learn/lessons/bugs
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
TopicDetailPage rendered form validation errors for the meta fields (title / tags / category / status) even when the inputs already had values.

## Steps to Reproduce
1. Open a Topic detail page (BRD editor).
2. Populate every meta field with a valid value.
3. Submit the form.

## Expected Result
The form validates and saves without complaining about empty meta fields.

## Actual Result
Element Plus flags the populated meta fields as invalid, blocking the save.

## Cause
The form model for the meta fields was bound to a different property than the one the validation rules referenced, so the rules always saw empty values.

## Solution
Align the form model keys with the validation rule `prop`s so the populated values are what the rules evaluate.
